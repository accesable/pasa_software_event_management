const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = async (options) => {
  options.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'apps/notification-service/src/mail/templates'),
          to: path.resolve(__dirname, 'dist/apps/notification-service/mail/templates'),
        },
      ],
    })
  );
  return options;
};
