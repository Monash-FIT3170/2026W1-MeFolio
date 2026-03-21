import { Header } from "./Header.jsx";
import { Tasks } from "./Tasks.jsx";

export const App = () => (
  <div className="page">
    <Header />
    <main className="main">
      <Tasks />
    </main>
  </div>
);
