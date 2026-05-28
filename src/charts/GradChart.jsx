import { useEffect, useRef } from "react";
import * as d3 from "d3";
import Papa from "papaparse";

export default function GradChart() {

  const svgRef = useRef();

  useEffect(() => {

    Papa.parse("/src/data/GradUnemployment.csv", {

      download: true,
      header: true,
      skipEmptyLines: true,

      beforeFirstChunk: (chunk) => {

        return chunk
          .split("\n")
          .slice(10)
          .join("\n");
      },

      complete: (results) => {

        // -------------------------
        // 데이터 정리
        // -------------------------

        const data = results.data

          .filter(d => d.Date)

          .map(d => ({

            date: new Date(d.Date),

            allWorkers: +d["All workers"],

            recentGrads: +d["Recent graduates"]

          }));

        // -------------------------
        // SVG
        // -------------------------

        const svg = d3.select(svgRef.current);

        svg.selectAll("*").remove();

        const width = 1400;
        const height = 700;

        const margin = {
          top: 110,
          right: 180,
          bottom: 70,
          left: 90
        };

        svg
          .attr("width", width)
          .attr("height", height);

        // -------------------------
        // Scale
        // -------------------------

        const xScale = d3.scaleTime()

          .domain(d3.extent(data, d => d.date))

          .range([
            margin.left,
            width - margin.right
          ]);

        const yScale = d3.scaleLinear()

          .domain([2, 14])

          .range([
            height - margin.bottom,
            margin.top
          ]);

        // -------------------------
        // Grid lines
        // -------------------------

        svg.append("g")

          .attr(
            "transform",
            `translate(${margin.left},0)`
          )

          .call(
            d3.axisLeft(yScale)
              .tickSize(
                -(width - margin.left - margin.right)
              )
              .tickFormat("")
          )

          .attr("opacity", 0.15);

        // -------------------------
        // Axis
        // -------------------------

        svg.append("g")

          .attr(
            "transform",
            `translate(0,${height - margin.bottom})`
          )

          .call(d3.axisBottom(xScale));

        svg.append("g")

          .attr(
            "transform",
            `translate(${margin.left},0)`
          )

          .call(d3.axisLeft(yScale));

        // -------------------------
        // Recent shaded area
        // -------------------------

        const shadeStart =
          new Date("2021-01-01");

        const shadeEnd =
          new Date("2026-01-01");

        const shadedArea = svg.append("rect")

          .attr(
            "x",
            xScale(shadeStart)
          )

          .attr(
            "y",
            margin.top
          )

          .attr(
            "width",
            xScale(shadeEnd) -
            xScale(shadeStart)
          )

          .attr(
            "height",
            height - margin.top - margin.bottom
          )

          .attr(
            "fill",
            "#d62728"
          )

          .attr("opacity", 0);

        // -------------------------
        // Line generator
        // -------------------------

        const line = d3.line()

          .x(d => xScale(d.date))

          .y(d => yScale(d.value));

        // -------------------------
        // All workers
        // -------------------------

        const allWorkersData = data.map(d => ({
          date: d.date,
          value: d.allWorkers
        }));

        const bluePath = svg.append("path")

          .datum(allWorkersData)

          .attr("fill", "none")

          .attr("stroke", "#2c6db2")

          .attr("stroke-width", 4)

          .attr("d", line);

        // -------------------------
        // Recent grads
        // -------------------------

        const recentGradsData = data.map(d => ({
          date: d.date,
          value: d.recentGrads
        }));

        const redPath = svg.append("path")

          .datum(recentGradsData)

          .attr("fill", "none")

          .attr("stroke", "#c73e2b")

          .attr("stroke-width", 4)

          .attr("d", line);

        // -------------------------
        // Scroll Animation
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

          path
            .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
        }

        // 초기 상태 숨김
        resetLine(bluePath);
        resetLine(redPath);

        // -------------------------
        // Main title
        // -------------------------

        svg.append("text")

          .attr("x", width / 2)

          .attr("y", 45)

          .attr("text-anchor", "middle")

          .style("font-size", "30px")

          .style("font-weight", "700")

          .text(
            "Recent college graduates now face higher unemployment than the overall workforce"
          );

        // -------------------------
        // Subtitle
        // -------------------------

        svg.append("text")

          .attr("x", width / 2)

          .attr("y", 82)

          .attr("text-anchor", "middle")

          .style("font-size", "18px")

          .style("fill", "#777")

          .text(
            "NY Fed Labor Market for Recent College Graduates · monthly, 1990–2026 · shaded = recent grad rate above all-worker rate"
          );

        // -------------------------
        // Legend
        // -------------------------

        svg.append("line")
          .attr("x1", 120)
          .attr("x2", 160)
          .attr("y1", 135)
          .attr("y2", 135)
          .attr("stroke", "#2c6db2")
          .attr("stroke-width", 4);

        svg.append("text")
          .attr("x", 175)
          .attr("y", 142)
          .text("All workers (overall unemployment)")
          .style("font-size", "18px")
          .style("font-weight", "bold");

        svg.append("line")
          .attr("x1", 120)
          .attr("x2", 160)
          .attr("y1", 175)
          .attr("y2", 175)
          .attr("stroke", "#c73e2b")
          .attr("stroke-width", 4);

        svg.append("text")
          .attr("x", 175)
          .attr("y", 182)
          .text("Recent college graduates (age 22–27)")
          .style("font-size", "18px")
          .style("font-weight", "bold");

        // -------------------------
        // Axis label
        // -------------------------

        svg.append("text")

          .attr(
            "transform",
            "rotate(-90)"
          )

          .attr("x", -height / 2)

          .attr("y", 25)

          .attr("text-anchor", "middle")

          .style("font-size", "20px")

          .text("Unemployment rate (%)");

        // -------------------------
        // Latest annotations
        // -------------------------

        const latest = data[data.length - 1];

        const recentText = svg.append("text")

          .attr(
            "x",
            width - 260
          )

          .attr(
            "y",
            yScale(latest.recentGrads) - 10
          )

          .text(
            `Recent grads: ${latest.recentGrads}%`
          )

          .style("fill", "#c73e2b")

          .style("font-size", "20px")

          .style("font-weight", "bold")

          .attr("opacity", 0);

        const workerText = svg.append("text")

          .attr(
            "x",
            width - 260
          )

          .attr(
            "y",
            yScale(latest.allWorkers) + 5
          )

          .text(
            `All workers: ${latest.allWorkers}%`
          )

          .style("fill", "#2c6db2")

          .style("font-size", "20px")

          .style("font-weight", "bold")

          .attr("opacity", 0);

        // -------------------------
        // Intersection Observer
        // -------------------------

        const observer = new IntersectionObserver(

          (entries) => {

            entries.forEach((entry) => {

              if (entry.isIntersecting) {

                // reset
                resetLine(bluePath);
                resetLine(redPath);

                recentText.attr("opacity", 0);
                workerText.attr("opacity", 0);

                shadedArea.attr("opacity", 0);

                // line animation
                animateLine(bluePath);
                animateLine(redPath);

                // shaded area animation
                shadedArea
                  .transition()
                  .delay(2200)
                  .duration(1200)
                  .attr("opacity", 0.06);

                // text animation
                recentText
                  .transition()
                  .delay(2600)
                  .duration(800)
                  .attr("opacity", 1);

                workerText
                  .transition()
                  .delay(2600)
                  .duration(800)
                  .attr("opacity", 1);
              }
            });
          },

          {
            threshold: 0.5
          }
        );

        observer.observe(svgRef.current);

      }

    });

  }, []);

  return (

    <div
      style={{
        width: "100%",
        overflowX: "auto",
        marginTop: "40px"
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minWidth: "1400px"
        }}
      >

        <svg ref={svgRef}></svg>

      </div>

    </div>
  );
}