import { useEffect, useState } from "react";
import { getHealth } from "./services/healthService";
import "./index.css";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHealth()
      .then((response) => setHealth(response.data))
      .catch((err) => setError(err.message || "Unable to connect"));
  }, []);

  return (
    <div className="app-shell">
      <div className="app-card">
        <h1 className="app-title">AI Database Assistant</h1>
        <p className="app-description">Frontend status check for your Java backend.</p>

        {health ? (
          <div className="status-card">
            <h2 className="status-title">Backend Health</h2>
            <pre className="status-body">{JSON.stringify(health, null, 2)}</pre>
          </div>
        ) : error ? (
          <div className="error-card">
            <h2 className="status-title">Backend Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="status-card">
            <p>Checking backend health...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
