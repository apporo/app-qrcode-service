'use strict';

var contextPath = '/qrcode-example';

module.exports = {
  application: {
  },
  plugins: {
    appQrcode: {
      nullable: false
    },
    appQrcodeService: {
      contextPath: contextPath
    }
  }
};
