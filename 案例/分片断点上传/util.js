filepParse(file, type = 'base64') {
  const caseType = {
    'base64': 'readAsDataURL',
    'buffer': 'readAsArrayBuffer'
  }
  const fileRead = new FileReader()
  return new Promise(resolve => {
    fileRead[caseType[type]](file)
    fileRead.onload = (res) => {
      resolve(res.target.result)
    }
  })
}
