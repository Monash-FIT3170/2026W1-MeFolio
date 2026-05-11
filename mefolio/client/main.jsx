import { createRoot } from "react-dom/client";
import { Meteor } from "meteor/meteor";
import { BrowserRouter } from "react-router-dom";
import { App } from "/imports/ui/App";
import "/imports/ui/styles.css";

Meteor.startup(() => {
  const container = document.getElementById("react-target");
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
