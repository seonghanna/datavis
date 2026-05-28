import { useEffect, useRef } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

export default function DecouplingChart() {

  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {

    // -------------------------
    // SP500 CSV 읽기
    // -------------------------

    Papa.parse("/src/data/SP500.csv", {
      download: true,
      header: true,

      complete: (spResult) => {

        // -------------------------
        // JOLTS CSV 읽기
        // -------------------------

        Papa.parse("/src/data/JOLTS.csv", {
          download: true,
          header: true,

          complete: (joltsResult) => {

            // -------------------------
            // SP500 데이터 정리
            // -------------------------

            const spData = spResult.data
              .filter(d => d.observation_date && d.SP500)
              .map(d => ({
                date: new Date(d.observation_date),
                value: +d.SP500
              }));

            // -------------------------
            // JOLTS 데이터 정리
            // -------------------------

            const joltsData = joltsResult.data
              .filter(
                d =>
                  d.series_id === "JTS000000000000000JOL"
              )
              .map(d => ({
                date: new Date(
                  `${d.year}-${d.period.replace("M", "")}-01`
                ),
                value: +d.value
              }));

            // -------------------------
            // Normalize
            // Nov 2022 = 100
            // -------------------------

            const spBase = spData.find(
              d =>
                d.date.getFullYear() === 2022 &&
                d.date.getMonth() === 10
            )?.value;

            const joltsBase = joltsData.find(
              d =>
                d.date.getFullYear() === 2022 &&
                d.date.getMonth() === 10
            )?.value;

            spData.forEach(d => {
              d.indexed = (d.value / spBase) * 100;
            });

            joltsData.forEach(d => {
              d.indexed = (d.value / joltsBase) * 100;
            });

            // -------------------------
            // SVG
            // -------------------------

            const svg = d3.select(svgRef.current);

            svg.selectAll("*").remove();

            const width = 1200;
            const height = 650;

            const margin = {
              top: 120,
              right: 120,
              bottom: 80,
              left: 120 
            };

            svg
              .attr("width", width)
              .attr("height", height);
            // -------------------------
// CLIP PATH
// -------------------------

            svg.append("defs")
              .append("clipPath")
              .attr("id", "chart-clip")
              .append("rect")
              .attr("x", margin.left)
              .attr("y", margin.top)
              .attr(
                "width",
                width - margin.left - margin.right
              )
              .attr(
                "height",
                height - margin.top - margin.bottom
              );

            // -------------------------
            // Scales
            // -------------------------

            const xScale = d3.scaleTime()
              .domain(d3.extent(spData, d => d.date))
              .range([
                margin.left,
                width - margin.right
              ]);

            const yScale = d3.scaleLinear()
              .domain([40, 190])
              .range([
                height - margin.bottom,
                margin.top
              ]);

            // -------------------------
            // Axis
            // -------------------------

            const xAxis = d3.axisBottom(xScale);

            svg.append("g")
              .attr(
                "transform",
                `translate(0,${height - margin.bottom})`
              )
              .call(xAxis);

            const yAxis = d3.axisLeft(yScale);

            svg.append("g")
              .attr(
                "transform",
                `translate(${margin.left},0)`
              )
              .call(yAxis);

            // -------------------------
            // 100 기준선
            // -------------------------

            svg.append("line")
              .attr("x1", margin.left)
              .attr("x2", width - margin.right)
              .attr("y1", yScale(100))
              .attr("y2", yScale(100))
              .attr("stroke", "gray")
              .attr("opacity", 0.5);

            // -------------------------
            // GPT Release 세로선
            // -------------------------

            const gptDate = new Date("2022-11-30");

            svg.append("line")
              .attr("x1", xScale(gptDate))
              .attr("x2", xScale(gptDate))
              .attr("y1", margin.top)
              .attr("y2", height - margin.bottom)
              .attr("stroke", "gray")
              .attr("stroke-dasharray", "5 5");

            svg.append("text")
              .attr("x", xScale(gptDate) + 10)
              .attr("y", margin.top + 20)
              .text("ChatGPT Release")
              .style("font-size", "14px");

            // -------------------------
            // Line Generator
            // -------------------------

            const line = d3.line()
              .x(d => xScale(d.date))
              .y(d => yScale(d.indexed))
              .curve(d3.curveMonotoneX);
              

            // -------------------------
            // SP500 Line
            // -------------------------

            const spPath = svg.append("path")
              .datum(spData)
              .attr("clip-path", "url(#chart-clip)")
              .attr("fill", "none")
              .attr("stroke", "#1f77b4")
              .attr("stroke-width", 3)
              .attr("d", line);

            // -------------------------
            // JOLTS Line
            // -------------------------

            const joltsPath = svg.append("path")
              .datum(joltsData)
              .attr("clip-path", "url(#chart-clip)")
              .attr("fill", "none")
              .attr("stroke", "#d62728")
              .attr("stroke-width", 3)
              .attr("d", line);

            // -------------------------
            // Animation
            // -------------------------

            function animateLine(path) {

              const length =
                path.node().getTotalLength();

              path
                .attr(
                  "stroke-dasharray",
                  length
                )
                .attr(
                  "stroke-dashoffset",
                  length
                )
                .transition()
                .duration(2500)
                .ease(d3.easeLinear)
                .attr(
                  "stroke-dashoffset",
                  0
                );
            }

            // -------------------------
            // Scroll-triggered Animation
            // -------------------------

            function resetLine(path) {

              const length =
                path.node().getTotalLength();

              path
                .interrupt()
                .attr("stroke-dasharray", length)
                .attr("stroke-dashoffset", length);
            }

            function animateLine(path) {

              const length =
                path.node().getTotalLength();

              path
                .transition()
                .duration(2500)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
            }

            // 초기 상태
            resetLine(spPath);
            resetLine(joltsPath);

            // observer 생성
            const observer = new IntersectionObserver(

              (entries) => {

                entries.forEach((entry) => {

                  if (entry.isIntersecting) {

                    // 다시 들어올 때마다 재실행
                    resetLine(spPath);
                    resetLine(joltsPath);

                    animateLine(spPath);
                    animateLine(joltsPath);
                  }
                });
              },

              {
                threshold: 0.5
              }
            );

            // svg 감시
            observer.observe(svgRef.current);

            // -------------------------
            // Legend
            // -------------------------

            svg.append("circle")
              .attr("cx", 140)
              .attr("cy", 50)
              .attr("r", 6)
              .attr("fill", "#1f77b4");

            svg.append("text")
              .attr("x", 155)
              .attr("y", 55)
              .text("S&P 500")
              .style("font-size", "14px");

            svg.append("circle")
              .attr("cx", 260)
              .attr("cy", 50)
              .attr("r", 6)
              .attr("fill", "#d62728");

            svg.append("text")
              .attr("x", 275)
              .attr("y", 55)
              .text("JOLTS Job Openings")
              .style("font-size", "14px");

            // -------------------------
            // Tooltip
            // -------------------------

            const tooltip = d3.select(
              tooltipRef.current
            );

            function addHoverDots(data, color, label) {

              svg.selectAll(`.${label}`)
                .data(data)
                .enter()
                .append("circle")
                .attr("class", label)
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yScale(d.indexed))
                .attr("r", 4)
                .attr("fill", color)
                .attr("opacity", 0)

                .on("mouseover", (event, d) => {

                  tooltip
                    .style("opacity", 1)
                    .html(`
                      <strong>${label}</strong><br/>
                      ${d.date.toLocaleDateString()}<br/>
                      Index: ${d.indexed.toFixed(1)}
                    `)
                    .style(
                      "left",
                      `${event.pageX + 10}px`
                    )
                    .style(
                      "top",
                      `${event.pageY - 20}px`
                    );
                })

                .on("mouseout", () => {
                  tooltip.style("opacity", 0);
                });
            }

            addHoverDots(
              spData,
              "#1f77b4",
              "sp500"
            );

            addHoverDots(
            joltsData,
            "#d62728",
            "jolts"
          );

            // -------------------------
            // Narrative Text
            // -------------------------

            svg.append("text")
              .attr("x", width / 2)
              .attr("y", height - 15)
              .attr("text-anchor", "middle")
              .style("font-size", "18px")
              .style("font-weight", "bold")
              .text(
                "Corporate value surged while hiring collapsed after GPT."
              );

          }
        });
      }
    });

  }, []);

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "40px",
        position: "relative"
      }}
    >

      <div>

        <h1
  style={{
    textAlign: "center",
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "16px"
  }}
>
  Post-GPT Decoupling
</h1>

<p
  style={{
    textAlign: "center",
    fontSize: "18px",
    lineHeight: "1.7",
    color: "#666",
    maxWidth: "850px",
    margin: "0 auto 40px auto"
  }}
>
  S&P index and job openings moved together until the release of GPT.
  <br />
  This graph shows how corporate value creation no longer depends on human labor.
</p>

<svg ref={svgRef}></svg>

      </div>

      {/* Tooltip */}

      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "white",
          padding: "10px",
          border: "1px solid gray",
          borderRadius: "8px",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.2s",
          fontSize: "14px"
        }}
      ></div>

    </div>
  );
}