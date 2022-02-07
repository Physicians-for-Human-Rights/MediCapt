Human ID
========

Internally MediCapt only deals with machine-generated IDs (usually IDs as
these are quite unpleasant for humans). These can be mapped back and forth to
human-manageable IDs to tag records, forms, users, locations, etc.

The private service for managing human-understandable IDs is called humanID.

A human id is a string `<prefix>3-xxx-xxx-xxc` or `<prefix>4-xxx-xxx-xxx-xxc` or
`<prefix>5-xxx-xxx-xxx-xxx-xxc` where `prefix` is any string, `x` is the main
part of the id, and `c` is check digit.

A record (with prefix MR for Medicapt Record) could have an id like: 
  MR3-XVP-6CK-9ZF
  MR4-XVP-6CK-9ZF-DPA
  MR5-XVP-6CK-9ZF-DPA-RFC
As opposed to the UUID which would be more like
      3dfa9e86-e905-475a-bb2c-de28d52e13de

Human ID is a quarter to half the length of the UUID. It provides scope through
the use of prefixes so that one can recognize the type of resource that is being
named. It is also far safer as the allowed character set in place of each `x` is
reduced to only 30 characters: `134789ABCDEFGHJKLMNOPQRSTUWXYZ`

`0256IV` are disallowed because of possible confusions

https://www.ismp.org/resources/misidentification-alphanumeric-symbols
https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3541865/

We could potentially inform users about this mapping or even normalize ids
`0` to `O`, `2` to `Z`, `5` to `S`, `6` to `G`, `I` to `1`, `V` to `U`
But we don't at the moment.

There 30^8, 30^11, 30^14, combinations at every level. The last level will
effectively never run out. 3-type prefixes will be available for the first tens
of millions of IDs. 4-type prefixes are very unlikely to ever run out, but we
have 5-type as a fallback.

### Security

The generated human IDs are random and are produced with a
cryptographically-secure random number generator. You can use them to encode
data that would otherwise be unsafe. But note, that human ID is a two way
system!

You provide a token, the service generates a two-way mapping between that token
and a new human ID it returns to you. This mapping is cached. You can look it up
in either direction. While we don't allow anyone to list these tables, don't put
protected information in them! They may be viewed for debugging purposes and
they are available project-wide. Any user with an account can in principle
resolve a human ID back to its associated tag with no controls.

No external service, even for logged in users, allows them to create their own
human IDs. They are created as a consequence of other resource creation in the
system, i.e., when a record is sealed it gets a human ID. This is done to
prevent denial of service attacks where a user attempts to attack a popular
prefix. Although, APIs are throttled and such an attack would likely not be
feasible anyway.

### Invariants

Note that you must pick a humanID space that is different from the machineIDs
that you have. Any overlap between the two will cause errors. Practically, this
is almost never an issue and UUIDs are disjoint from humanID. But you cannot use
this service for mapping humanIDs to one another unless their prefixes are
different.

Since this is a two-way mapping, only one humanID can be associated with a
machineID and vice versa. You don't need to worry about this as the API presents
no means by which you could create multiple associations even if you tried.

The check digit is there to prevent typos. The string before the check digit is
hashed with MD5. The first output in the hash which is within the restricted
alphabet that human ID uses will be used as the check digit. This provides
robustness to a wide range of errors.

### Generating human IDs

IDs are generated randomly. We probe dynamo to check if that ID exists. If so,
we retry with a new random ID. If again we get unlucky, we produce an ID that is
one step larger for that ID. 5-type prefixes are retried 4 times at which point
we error out because something has gone awry. This number of collisions is so
astronomically unlikely that a bug is certain.

Right now, we don't record anything permanent to stop us from probing repeatedly
as IDs expire. One day, it will be worth adding another table to skip the first
rounds of probing for IDs which become very busy.

We do record within a global map the lambda what kind of human ID could be
generated from that prefix. We treat that as a high water mark and don't try to
generate lower IDs. At high usage lambda containers are reused for many calls,
this already naturally prevents most futile attempts at generating low IDs for
popular prefixes.

NB See the note in the humanid backend on the dynamo table layout.

### API

Internally this service provides a single lambda function which other services
can invoke. This function is not connected to any API gateway.

It provides an API with two abilities:

`{ action: "machineID-to-humanID", machineID: "id", suggestedPrefix: "prefix" }`

Produces a new humanID for a given id. This is a unique identifier understandable
to humans. Since human ID provides a two way mapping, attempting to create a new
mapping for an existing id will return the old humanID. Note that the prefix
returned may not be the one you expect if the humanID was created with a
different prefix.

`{ action: "humanID-to-machineID", humanID: "id" }`

Resolves the humanID to a machineID.
