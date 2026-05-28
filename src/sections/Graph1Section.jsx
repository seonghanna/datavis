import DecouplingChart from "../charts/DecouplingChart";

export default function Graph1Section() {

  return (

    <section
      style={{
        minHeight: "100vh",
        paddingTop: "120px",
        paddingBottom: "120px",
        background: "#f5f5f5",

        animation: "fadeUp 1s ease"
      }}
    >

      <div
        style={{
          width: "1200px",
          margin: "0 auto"
        }}
      >

        <h2
          style={{
            fontSize: "48px",
            marginBottom: "24px",
            lineHeight: "1.2"
          }}
        >
          Corporate Growth Has <br />
          Decoupled From Employment
        </h2>

        <p
          style={{
            fontSize: "24px",
            lineHeight: "1.8",
            width: "900px",
            marginBottom: "70px",
            color: "#444"
          }}
        >
          Since the release of ChatGPT, corporate value has surged
          while hiring demand has collapsed. The traditional
          relationship between economic growth and employment
          is beginning to break apart.
        </p>

        <DecouplingChart />

      </div>

    </section>
  );
}