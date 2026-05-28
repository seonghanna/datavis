import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

export default function OccupationChart() {
  const svgRef = useRef();

  const [mode, setMode] = useState("all");

  const occupationGroups = {
    all: [
      "Cashiers",
      "Office Clerks, General",
      "Production Occupations",
      "Retail Sales Workers",
      "Healthcare Support Occupations",
      "Business Operations Specialists",
      "Management Occupations",
      "Top Executives",
    ],

    declining: [
      "Cashiers",
      "Office Clerks, General",
      "Production Occupations",
      "Retail Sales Workers",
    ],

    growing: [
      "Healthcare Support Occupations",
      "Business Operations Specialists",
      "Management Occupations",
      "Top Executives",
    ],

    whitecollar: [
      "Business Operations Specialists",
      "Management Occupations",
      "Top Executives",
      "Office Clerks, General",
    ],

    service: [
      "Cashiers",
      "Retail Sales Workers",
      "Healthcare Support Occupations",
    ],
  };

  useEffect(() => {
    Promise.all([
      d3.csv("/data/all_data_M_2019.csv"),
      d3.csv("/data/all_data_M_2020.csv"),
      d3.csv("/data/all_data_M_2021.csv"),
      d3.csv("/data/all_data_M_2022.csv"),
      d3.csv("/data/all_data_M_2023.csv"),
      d3.csv("/data/all_data_M_2024.csv"),
      d3.csv("/data/all_data_M_2025.csv"),
    ]).then((files) => {
      const years = [
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
        2025,
      ];

      const combined = [];

      files.forEach((file, i) => {
        const year = years[i];

        file.forEach((d) => {
          if (
            d.AREA_TITLE === "U.S." &&
            d.OCC_TITLE &&
            occupationGroups.all.includes(
              d.OCC_TITLE
            )
          ) {
            combined.push({
              year: +year,
              occupation: d.OCC_TITLE,
              employment: +d.TOT_EMP,
            });
          }
        });
      });

      const selectedOccupations =
        occupationGroups[mode];

      const selected = combined
        .filter((d) =>
          selectedOccupations.includes(
            d.occupation
          )
        )
        .filter(
          (d) => !isNaN(d.employment)
        );

      console.log(selected);

      drawChart(selected);
    });
  }, [mode]);

  const drawChart = (data) => {
    d3.select(svgRef.current).selectAll("*").remove();

    if (!data.length) return;

    const width = 1500;
    const height = 850;

    const margin = {
      top: 120,
      right: 340,
      bottom: 70,
      left: 100,
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([2019, 2025])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.employment) *
          0.9,
        d3.max(data, (d) => d.employment) *
          1.05,
      ])
      .range([
        height - margin.bottom,
        margin.top,
      ]);

    svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${
          height - margin.bottom
        })`
      )
      .call(
        d3
          .axisBottom(x)
          .tickFormat(d3.format("d"))
      );

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},0)`
      )
      .call(
        d3
          .axisLeft(y)
          .tickFormat(d3.format(".2s"))
      );

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .style("font-size", "30px")
      .style("font-weight", "700")
      .text("Occupation Divergence");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 90)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#666")
      .text(
        "Some occupations are collapsing while others continue growing"
      );

    const grouped = d3.groups(
      data,
      (d) => d.occupation
    );

    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.employment))
      .curve(d3.curveMonotoneX);

    grouped.forEach(
      ([occupation, values], index) => {
        values.sort(
          (a, b) => a.year - b.year
        );

        const isDeclining =
          occupation === "Cashiers" ||
          occupation ===
            "Office Clerks, General" ||
          occupation ===
            "Production Occupations" ||
          occupation ===
            "Retail Sales Workers";

        const color = isDeclining
          ? "#b22222"
          : "#2563eb";

        const path = svg
          .append("path")
          .datum(values)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 4)
          .attr("d", line);

        const totalLength =
          path.node().getTotalLength();

        path
          .attr(
            "stroke-dasharray",
            totalLength
          )
          .attr(
            "stroke-dashoffset",
            totalLength
          )
          .transition()
          .duration(2200)
          .ease(d3.easeLinear)
          .attr(
            "stroke-dashoffset",
            0
          );

        const lastPoint =
          values[values.length - 1];

        svg
          .append("text")
          .attr(
            "x",
            x(lastPoint.year) + 14
          )
          .attr(
            "y",
            y(lastPoint.employment) +
              index * 12
          )
          .text(occupation)
          .style("font-size", "14px")
          .style("font-weight", "700")
          .style("fill", color);
      }
    );

    svg
      .append("text")
      .attr("x", 45)
      .attr("y", height / 2)
      .attr(
        "transform",
        `rotate(-90,45,${
          height / 2
        })`
      )
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text("Total employment");
  };

  const buttonStyle = (active) => ({
    padding: "10px 18px",
    borderRadius: "999px",
    border: active
      ? "1px solid black"
      : "1px solid #ccc",
    background: active ? "black" : "white",
    color: active ? "white" : "#333",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "0.2s",
  });

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "25px",
          marginBottom: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          style={buttonStyle(
            mode === "all"
          )}
          onClick={() => setMode("all")}
        >
          All
        </button>

        <button
          style={buttonStyle(
            mode === "declining"
          )}
          onClick={() =>
            setMode("declining")
          }
        >
          Declining
        </button>

        <button
          style={buttonStyle(
            mode === "growing"
          )}
          onClick={() =>
            setMode("growing")
          }
        >
          Growing
        </button>

        <button
          style={buttonStyle(
            mode === "whitecollar"
          )}
          onClick={() =>
            setMode("whitecollar")
          }
        >
          White-collar
        </button>

        <button
          style={buttonStyle(
            mode === "service"
          )}
          onClick={() =>
            setMode("service")
          }
        >
          Service
        </button>
      </div>

      <svg ref={svgRef}></svg>
    </div>
  );
}