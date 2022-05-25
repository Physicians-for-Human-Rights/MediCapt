The basic operations are:

`terragrunt destroy -auto-approve`

`terragrunt apply -auto-approve`

### Image storage

Images are stored exclusively in `webp` with quality set to 70%. This should
save 80% or so of the bandwidth we would use with jpegs at 4MP. A record upload
(4 images typically + negligible amounts of text) goes from 4MB to under 1MB.

https://havecamerawilltravel.com/webp-website/

### Testing

#### Compliance testing

#### Integration/E2E tests

