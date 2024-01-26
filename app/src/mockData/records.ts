import {
  RecordMetadata,
  RecordManifestWithData,
  RecordPostServer,
  RecordGetServer,
} from 'utils/types/recordMetadata'

export const record1: RecordGetServer = {
  metadata: {
    'storage-version': '1.0.0',
    country: 'AX',
    locationID: 'ML3-XTM-1M7-DC9',
    language: 'en',
    'official-name': 'TF',
    'official-code': 'TFX',
    title: 'TestForm1New',
    subtitle: 'X',
    priority: '1',
    enabled: true,
    tags: 'sexual-assault',
    manifestMD5: 'vQYralxlekKDkN8rQ45bJA==',
    manifestHash: 'fZw7n3NQUOLU66O8QdRqHXyuRoaBc9OjoZlkTXTzvgE=',
    formUUID: '9e956e83-1443-4024-ab37-250da1a3a557',
    formID: 'MF3-7D3-XF8-RZC',
    createdDate: new Date('2022-04-29T03:42:15.921Z'),
    createdByUUID: 'a28d4e0e-8dcc-49d3-9b52-8a18d9c4931f',
    lastChangedDate: new Date('2022-12-06T17:29:14.271Z'),
    lastChangedByUUID: 'c9cbbf59-4afa-4195-90b8-2168d3d3c5f2',
    version: '39',
  },
  manifest: {
    'storage-version': '1.0.0',
    root: 'CjBeLTGqTyFyyj7UH/93imPs0z5XXBucRmacRw9ZE3I=',
    contents: [
      {
        sha256: 'CjBeLTGqTyFyyj7UH/93imPs0z5XXBucRmacRw9ZE3I=',
        filetype: 'text/yaml',
        filename: 'form.yaml',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/0a305e2d31aa4f2172ca3ed41fff778a63ecd33e575c1b9c46669c470f591372.yaml?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=62c32e40f0d7f85eee75491dc13b3bd2f4c2fe00df07c56c052756c7268885aa&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'njXfOzcvotOqV8joY3xi9H6NfJIfyU1Fw9N0RqiyP1c=',
        filetype: 'image/webp',
        filename: 'image1.webp',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/9e35df3b372fa2d3aa57c8e8637c62f47e8d7c921fc94d45c3d37446a8b23f57.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=52032aa00b43dff02593772cf0d8b14d2ea907d464d782acae7cd62b3a1ee71c&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'Gfj5cAmWL2x7fV6r04x3MUo9UmLl6B/dTLCvNylf8pc=',
        filetype: 'application/pdf',
        filename: 'form.pdf',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/19f8f97009962f6c7b7d5eabd38c77314a3d5262e5e81fdd4cb0af37295ff297.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=3f25d0da01c31f61b7854126d6bed9cbde3cbeafb7973d30bbd998af169f94aa&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'TL+hItzq47U39Yv3G/p0BbOptyU4+e21F2lhSEUMkzI=',
        filetype: 'image/webp',
        filename: 'ministry_logo',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/4cbfa122dceae3b537f58bf71bfa7405b3a9b72538f9edb517696148450c9332.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=910d132bff0440aa23a4309a51fe0e1e69c85369ba4339fe6b6f6b56867af8b9&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: '9PXtacBoyr7UFQCDcInFVtM1v93qwR19tLSpFTYAkRg=',
        filetype: 'image/webp',
        filename: 'bottom',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/f4f5ed69c068cabed41500837089c556d335bfddeac11d7db4b4a91536009118.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=79574488c5ef288329a6b482b46ff036d19165f667fa8e8be194caaab9e45319&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'I5sWR5igNVAQGiHDfDoSH6jxKDrCJxWL9YmnETxrbPs=',
        filetype: 'image/webp',
        filename: 'female-1',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/239b164798a03550101a21c37c3a121fa8f1283ac227158bf589a7113c6b6cfb.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=e6e7357b456c9a3838dc2a593bca2878518fbd4baf1f0b31517bce35bf913549&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'dSWMKnUeNRPyZYoB3u25ha3uCFY/gzbN5e6/Hwj75Vo=',
        filetype: 'image/webp',
        filename: 'female-2',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/75258c2a751e3513f2658a01deedb985adee08563f8336cde5eebf1f08fbe55a.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=a95de6f48e4dc4bfd331cc7849797dd9c5d58069a140a18c9c72addef6117c82&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'cSl+uK6hFrhVrlAHihBGULpNUxiltHx/7ZUof87Cxl8=',
        filetype: 'image/webp',
        filename: 'female-3',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/71297eb8aea116b855ae50078a104650ba4d5318a5b47c7fed95287fcec2c65f.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=f299bbce80af463a6ab450f30e4810e9745bfdf721efdcf91f6da3320a5076a5&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'MJvQksxHCqAxECg8MP+t9EwiO8pJQ2HiS5dcbdJzTzI=',
        filetype: 'image/webp',
        filename: 'male-1',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/309bd092cc470aa03110283c30ffadf44c223bca494361e24b975c6dd2734f32.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=9e1f82a04958a4da55c85d7ab7f4a5ce78594a3d8ffbed8fd4c4a5134f09579f&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: '08d00NoHqa/okpFszpz/TYqZMV9lKVtxjhQy8mZofA8=',
        filetype: 'image/webp',
        filename: 'male-2',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/d3c774d0da07a9afe892916cce9cff4d8a99315f65295b718e1432f266687c0f.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=a5f7b526519f3e5d94567d06ef42890644e5de3b3e756e5acdbdd418a76c5489&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'drCsvNNTg6DzqfPrPTQoyg05FZ1+v9doP/5hqN7e1DY=',
        filetype: 'image/webp',
        filename: 'male-3',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/76b0acbcd35383a0f3a9f3eb3d3428ca0d39159d7ebfd7683ffe61a8deded436.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=b406b5520ba101646735894b181892ad37922a9b5ed919a3485dcd2a547cbef7&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'kkO0NYTQwFOrYK86w7slauPDFIaHz0FS826G4jKxQb0=',
        filetype: 'image/webp',
        filename: 'posterior',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/9243b43584d0c053ab60af3ac3bb256ae3c3148687cf4152f36e86e232b141bd.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=e4f23ba13b0a9d732c332746f98a7531d11db5be285ae67a44abc0680681ec9c&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'KvkiNloCXzn+7AKh2xsjGAl5PabKM9pic4pE9Yek+vA=',
        filetype: 'image/webp',
        filename: 'anterior',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/2af922365a025f39feec02a1db1b231809793da6ca33da62738a44f587a4faf0.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=2f747c0aefcab4f44a5776dedc65561e5a519f1d7228aca2737aa229b72a3869&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'OIyyQSS/1Vx8c6hp1UrF2oa5DaV45YdxLTPBunP950M=',
        filetype: 'image/webp',
        filename: 'top',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/388cb24124bfd55c7c73a869d54ac5da86b90da578e587712d33c1ba73fde743.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=a0dc7cd37c5e207db4c9c630587a5605c09955a0b08630f9c70be8a3e26bb838&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'ym1I5SiPvOesVYzO/ivsqTW3DW0eUTpO5CJyByf6qWE=',
        filetype: 'image/webp',
        filename: 'signature',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/ca6d48e5288fbce7ac558ccefe2beca935b70d6d1e513a4ee422720727faa961.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=33bde7c32b70b7e754322f89237a18bf4fb3f29626019986dff21f085a6e5d2d&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'Xf1Nf6HymWS4EuU2BCtH7KDEvwR/6Qdkm1guYLRYwc0=',
        filetype: 'image/webp',
        filename: 'image15.webp',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/5dfd4d7fa1f29964b812e536042b47eca0c4bf047fe907649b582e60b458c1cd.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=14d4465f002b776dc9af41f62c85ec848245bffe149357872ee25f6d621f7e68&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
      {
        sha256: 'Xf1Nf6HymWS4EuU2BCtH7KDEvwR/6Qdkm1guYLRYwc0=',
        filetype: 'image/webp',
        filename: 'image16.webp',
        link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/5dfd4d7fa1f29964b812e536042b47eca0c4bf047fe907649b582e60b458c1cd.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=14d4465f002b776dc9af41f62c85ec848245bffe149357872ee25f6d621f7e68&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
      },
    ],
  },
  manifestLink: {
    sha256: 'fZw7n3NQUOLU66O8QdRqHXyuRoaBc9OjoZlkTXTzvgE=',
    filetype: 'manifest',
    filename: 'manifest',
    link: 'https://medicapt-dev-forms.s3.amazonaws.com//9e956e83-1443-4024-ab37-250da1a3a557/7d9c3b9f735050e2d4eba3bc41d46a1d7cae46868173d3a3a199644d74f3be01.manifest?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5PUVEDJEJXI6ZKFG%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T205153Z&X-Amz-Expires=600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIHahrf%2BT8NUCt18TOI6trCnyrs1Vvnj5QLlqaHCrJQGkAiA%2B9HCyYXxtYZ3lR5i%2BYSplQxK0um5%2Fxymk7XSRMsh%2BqSqxAwhOEAAaDDkyNjk1MTkzODYzMiIMMjZHsUgEuD%2BOzKoCKo4DMWi%2FLjRSaBy76cLT3XQattv0nWoq1FLEMvKcTYBJnMl%2FdLijLtt9owAprsaxxfwNbeBsRe%2BnQwPHwkDsqUHkph7VUNNTw6m1iOKlClL6z%2BJUPntTKPhiwaJuI5vWgezJpd8wPCcUWwYfed%2B01PI%2Beb6ZlTka%2BdcUjDc%2BP1CdmN%2BXCRnp93k5HTzuaWcUyQJhxzXw4jnLqsfNE6qx42iM3vJGAMco4beHkz3Isi0TAMzjE%2FosmjEG%2BD3BwIIPUED9X6YzSPRCcfS%2FnGIYoZv3qvWBB8Op68BUv1dKyfk%2Fn2DB8RPbd%2FIKZqDS8aSIrY82%2FzRdK69VhaYzn2ettSPL4Dw2D486YBDjLm0JjnFqBhHnpg%2B84cmJWS7vmQj20SzBgYBRDFEeqpFA9ShMZKtroLIvxW39HquYr7ohPmkTZbNo9T3OjGsZJQaXYWe3fGUTdRLxkrCvOvdccvxZYKgYcmdgD7lroxQ5H9bCE9AjsB44zjyO6tDKScQkrXxhpgtURdl%2FhXHDYQfLvDAA5Icw58yGrQY6ngFaPi087fHbviGnbCzWW%2BYv%2FW3UXLvGXKwiCabhE5AWCGK5FWPZeKg4x6W6DedDEQmttAfgxkwUA9BAtVpR4CiRHbqTyeG7I%2Bj3lRzD4bqIkgWFNhlVVLyZDOfOmmNjXheao8Bg6i%2Burzj8Ee7F989zuwejbba966db60T3QQhceYWB3Ch1eJP0yBjC6A6HOZRvUoD2KkFOMfCo5RbyAw%3D%3D&X-Amz-Signature=d03993d370b2f711be7e0aa162094ee497aebbd7600faa75057c3212217bdc3c&X-Amz-SignedHeaders=host&response-cache-control=private%2C%20max-age%3D31536000%2C%20immutable',
  },
}