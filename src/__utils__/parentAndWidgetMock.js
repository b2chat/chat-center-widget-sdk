const { JSDOM, ResourceLoader } = require("jsdom");

const parentAndWidgetMock = () => {
  class CustomResourceLoader extends ResourceLoader {
    async fetch() {
      return Buffer.from("");
    }
  }

  // This represent the parent/global window instance
  const window = new JSDOM(
    `<!DOCTYPE html>
    <iframe src="https://widget.company.com"></iframe>
  `,
    {
      url: "https://app.b2chat.io",
      resources: new CustomResourceLoader(),
    }
  ).window;

  globalThis.window = window;

  // This represents IFrame.contentWindow
  const widgetContentWindow = window.frames[0];

  widgetContentWindow.postMessage = (data) => {
    widgetContentWindow.dispatchEvent(
      new widgetContentWindow.MessageEvent("message", {
        origin: window.location.origin,
        source: window,
        data,
      })
    );
  };

  window.postMessage = (data) => {
    window.dispatchEvent(
      new window.MessageEvent("message", {
        origin: widgetContentWindow.location.origin,
        source: widgetContentWindow,
        data,
      })
    );
  };

  // #region
  const { WidgetMessagePort } = require("../internal/WidgetMessagePort");
  // It binds the parent Window with the Widget's contentWindow
  const windowPort = new WidgetMessagePort(window);
  windowPort.addMessagePort(
    widgetContentWindow,
    widgetContentWindow.location.origin
  );

  const widgetPort = new WidgetMessagePort(widgetContentWindow);
  widgetPort.addMessagePort(window, window.location.origin);
  // #endregion

  return {
    window,
    widgetContentWindow,
    windowPort,
    widgetPort,
  };
};

exports.parentAndWidgetMock = parentAndWidgetMock;
