import "./App.css";
import DecouplingChart from "./charts/DecouplingChart";
import GradChart from "./charts/GradChart";
import SectorCollapseChart from "./charts/SectorCollapseChart";
import OccupationChart from "./charts/OccupationChart";
import QuitsChart from "./charts/QuitsChart";
import BusinessApplicationsChart from "./charts/BusinessApplicationsChart";

function App() {
  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        color: "#111",
      }}
    >
      {/* =====================================
          HERO SECTION
      ====================================== */}

      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        <h1
          style={{
            fontSize: "84px",
            fontWeight: 800,
            marginBottom: "30px",
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          AI Economy Shift
        </h1>

        <p
          style={{
            fontSize: "30px",
            color: "#555",
            marginBottom: "40px",
            fontWeight: 500,
          }}
        >
          How AI reshaped jobs,
          hiring, and entrepreneurship
        </p>

        <p
          style={{
            fontSize: "22px",
            color: "#666",
            lineHeight: 1.9,
            maxWidth: "1000px",
            fontWeight: 400,
          }}
        >
          Corporate growth has become disconnected
          from employment.
          <br />
          <br />
          Job losses are becoming concentrated
          in specific sectors.
          <br />
          <br />
          Recent college graduates are getting hit first,
          and traditional career paths are disappearing.
          <br />
          <br />
          Something new is replacing them.
        </p>

        <div
          style={{
            marginTop: "100px",
            color: "#555555",
            fontSize: "16px",
            letterSpacing: "2px",
            animation: "floatPulse 2s ease-in-out infinite",
            display: "inline-block",
          }}
        >
          SCROLL TO EXPLORE ↓
        </div>
      </section>
      <section 
        style={{
          marginBottom: "450px",
        }}>
        <DecouplingChart />
      </section>
      {/* =====================================
          1. Graduate Unemployment
      ====================================== */}

      <section
        style={{
          marginBottom: "450px",
        }}
      >
        <GradChart />
      </section>

      {/* =====================================
          2. Industry Hiring Collapse
      ====================================== */}

      <section
        style={{
          marginBottom: "450px",
        }}
      >
        <SectorCollapseChart />
      </section>

      {/* =====================================
          3. Occupation Divergence
      ====================================== */}

      <section
        style={{
          marginBottom: "450px",
        }}
      >
        <OccupationChart />
      </section>

      {/* =====================================
          4. Quits Rate
      ====================================== */}

      <section
        style={{
          marginBottom: "450px",
        }}
      >
        <QuitsChart />
      </section>

      {/* =====================================
          5. Business Applications
      ====================================== */}

      <section
        style={{
          paddingBottom: "450px",
        }}
      >
        <BusinessApplicationsChart />
      </section>
    </div>
  );
}

export default App;