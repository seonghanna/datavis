export default function HeroSection() {

  return (

    <section
      style={{
        height: "100vh",
        background: "#111",
        color: "white",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",

        paddingLeft: "120px",
        position: "relative"
      }}
    >

      <h1
        style={{
          fontSize: "96px",
          marginBottom: "20px",
          fontWeight: "700",
          lineHeight: "1.1"
        }}
      >
        The New <br />
        Labor Market
      </h1>

      <p
        style={{
          fontSize: "28px",
          width: "800px",
          lineHeight: "1.6",
          color: "#cccccc"
        }}
      >
        Corporate growth has decoupled from employment.
        Job losses are concentrated by sector and occupation.
      </p>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "120px",
          fontSize: "18px",
          opacity: 0.7
        }}
      >
        ↓ Scroll to explore
      </div>

    </section>
  );
}