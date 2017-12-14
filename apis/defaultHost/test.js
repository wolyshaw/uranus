module.exports = async (params, auth) => {
  return new Promise(function (resolve, reject) {
    resolve({params, auth})
  })
}
