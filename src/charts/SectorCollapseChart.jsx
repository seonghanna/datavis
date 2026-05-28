import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import sectorData from "../data/job_postings_by_sector_US.csv?raw";

export default function SectorCollapseChart() {
  const svgRef = useRef();

  // =====================================================
  // TOP CATEGORY GROUPS
  // =====================================================

  const sectorGroups = {
    Technology: [
      "Software Development",
      "IT Infrastructure, Operations & Support",
      "IT Systems & Solutions",
      "Data & Analytics",
      "Electrical Engineering",
    ],

    "Business & Finance": [
      "Banking & Finance",
      "Accounting",
      "Human Resources",
      "Management",
      "Project Management",
      "Marketing",
    ],

    "Service & Retail": [
      "Retail",
      "Customer Service",
      "Hospitality & Tourism",
      "Food Preparation & Service",
      "Cleaning & Sanitation",
    ],

    Healthcare: [
      "Nursing",
      "Pharmacy",
      "Medical Technician",
      "Medical Information",
      "Physicians & Surgeons",
    ],

    Industrial: [
      "Production & Manufacturing",
      "Industrial Engineering",
      "Installation & Maintenance",
      "Civil Engineering",
      "Architecture",
    ],

    Education: [
      "Education & Instruction",
      "Community & Social Service",
      "Legal",
      "Security & Public Safety",
    ],
  };

  // =====================================================
  // STATE
  // =====================================================

  const [selectedCategory, setSelectedCategory] =
    useState("Technology");

  const [selectedSector, setSelectedSector] =
    useState(null);

  const [hoveredLine, setHoveredLine] =
    useState(null);

  // =====================================================
  // PARSE CSV
  // =====================================================

  const parsedData = useMemo(() => {
    const raw = d3.csvParse(sectorData);

    const filtered = raw.filter(
      (d) =>
        d.variable === "new postings" &&
        d.jobcountry === "US"
    );

    const grouped = d3.group(
      filtered,
      (d) => d.display_name
    );

    const result = [];

    grouped.forEach((values, key) => {
      const cleaned = values
        .map((d) => ({
          date: new Date(d.date),
          value:
            +d.indeed_job_postings_index,
        }))
        .filter(
          (d) => !isNaN(d.value)
        );

      if (cleaned.length > 0) {
        result.push({
          name: key,
          values: cleaned,
        });
      }
    });

    return result;
  }, []);

  // =====================================================
  // CATEGORY FILTER
  // =====================================================

  const categoryData = useMemo(() => {
    return parsedData.filter((d) =>
      sectorGroups[
        selectedCategory
      ]?.includes(d.name)
    );
  }, [parsedData, selectedCategory]);

  // =====================================================
  // FINAL FILTER
  // =====================================================

  const filteredData = useMemo(() => {
    if (!selectedSector) {
      return categoryData;
    }

    return categoryData.filter(
      (d) => d.name === selectedSector
    );
  }, [categoryData, selectedSector]);

  // =====================================================
  // DRAW CHART
  // =====================================================

  useEffect(() => {
    if (!filteredData.length) return;

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const width = 1350;
    const height = 720;

    const margin = {
      top: 100,
      right: 260,
      bottom: 80,
      left: 90,
    };

    svg
      .attr("width", width)
      .attr("height", height);

    // =====================================================
    // SCALE
    // =====================================================

    const x = d3
      .scaleTime()
      .domain([
        d3.min(filteredData, (d) =>
          d3.min(
            d.values,
            (v) => v.date
          )
        ),

        d3.max(filteredData, (d) =>
          d3.max(
            d.values,
            (v) => v.date
          )
        ),
      ])
      .range([
        margin.left,
        width - margin.right,
      ]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) =>
          d3.min(
            d.values,
            (v) => v.value
          )
        ) - 10,

        d3.max(filteredData, (d) =>
          d3.max(
            d.values,
            (v) => v.value
          )
        ) + 10,
      ])
      .range([
        height - margin.bottom,
        margin.top,
      ]);

    // =====================================================
    // GRID
    // =====================================================

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},0)`
      )
      .call(
        d3
          .axisLeft(y)
          .tickSize(
            -(
              width -
              margin.left -
              margin.right
            )
          )
          .tickFormat("")
      )
      .style("color", "#e5e5e5");

    // =====================================================
    // AXIS
    // =====================================================

    svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${
          height - margin.bottom
        })`
      )
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},0)`
      )
      .call(d3.axisLeft(y));

    // =====================================================
    // TITLE
    // =====================================================

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "34px")
      .style("font-weight", 700)
      .text(
        "Hiring Trends by Core Industries"
      );

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 72)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#777")
      .text(
        "Select sectors and hover to compare trajectories"
      );

    // =====================================================
    // LINE GENERATOR
    // =====================================================

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // =====================================================
    // DRAW LINES
    // =====================================================

    filteredData.forEach((sector) => {
      const first =
        sector.values[0]?.value;

      const last =
        sector.values[
          sector.values.length - 1
        ]?.value;

      const isGrowing =
        last > first;

      const activeColor = isGrowing
        ? "#2563eb"
        : "#b91c1c";

      const isHovered =
        hoveredLine === sector.name;

      // =====================================================
      // LINE
      // =====================================================

      svg
        .append("path")
        .datum(sector.values)

        .attr("fill", "none")

        .attr(
          "stroke",
          isHovered
            ? activeColor
            : "#cfcfcf"
        )

        .attr(
          "stroke-width",
          isHovered ? 4.5 : 2
        )

        .attr(
          "opacity",
          hoveredLine
            ? isHovered
              ? 1
              : 0.15
            : 1
        )

        .attr("d", line)

        .style(
          "transition",
          "all 0.25s ease"
        )

        .style("cursor", "pointer")

        .on("mouseenter", () => {
          setHoveredLine(
            sector.name
          );
        })

        .on("mouseleave", () => {
          setHoveredLine(null);
        });

      // =====================================================
      // LABELS
      // =====================================================

      const lastPoint =
        sector.values[
          sector.values.length - 1
        ];

      svg
        .append("text")
        .attr(
          "x",
          width -
            margin.right +
            15
        )

        .attr(
          "y",
          y(lastPoint.value)
        )

        .attr(
          "alignment-baseline",
          "middle"
        )

        .style(
          "font-size",
          isHovered
            ? "17px"
            : "13px"
        )

        .style(
          "font-weight",
          isHovered
            ? 700
            : 500
        )

        .style(
          "fill",
          isHovered
            ? activeColor
            : "#bdbdbd"
        )

        .style(
          "opacity",
          hoveredLine
            ? isHovered
              ? 1
              : 0.15
            : 1
        )

        .style(
          "transition",
          "all 0.25s ease"
        )

        .text(sector.name);
    });

    // =====================================================
    // BASELINE
    // =====================================================

    svg
      .append("line")
      .attr(
        "x1",
        margin.left
      )
      .attr(
        "x2",
        width - margin.right
      )
      .attr(
        "y1",
        y(100)
      )
      .attr(
        "y2",
        y(100)
      )
      .attr(
        "stroke",
        "#999"
      )
      .attr(
        "stroke-dasharray",
        "5 5"
      );

    // =====================================================
    // LABELS
    // =====================================================

    svg
      .append("text")
      .attr(
        "transform",
        "rotate(-90)"
      )
      .attr("x", -height / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .text(
        "New Job Postings Index (100 = Baseline)"
      );

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .text("Timeline");
  }, [filteredData, hoveredLine]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        marginTop: "120px",
        marginBottom: "180px",
      }}
    >
      {/* ===================================================== */}
      {/* TOP CATEGORY BUTTONS */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "24px",
          paddingLeft: "40px",
        }}
      >
        {Object.keys(sectorGroups).map(
          (category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(
                  category
                );

                setSelectedSector(
                  null
                );
              }}
              style={{
                padding: "14px 28px",

                borderRadius:
                  "999px",

                border:
                  selectedCategory ===
                  category
                    ? "none"
                    : "1px solid #d0d0d0",

                background:
                  selectedCategory ===
                  category
                    ? "black"
                    : "white",

                color:
                  selectedCategory ===
                  category
                    ? "white"
                    : "#333",

                fontSize: "17px",
                fontWeight: 600,

                cursor: "pointer",

                transition:
                  "all 0.25s ease",
              }}
            >
              {category}
            </button>
          )
        )}
      </div>

      {/* ===================================================== */}
      {/* SUB CATEGORY BUTTONS */}
      {/* ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "40px",
          paddingLeft: "40px",
        }}
      >
        <button
          onClick={() =>
            setSelectedSector(null)
          }
          style={{
            padding: "10px 20px",

            borderRadius: "999px",

            border:
              selectedSector === null
                ? "none"
                : "1px solid #d0d0d0",

            background:
              selectedSector === null
                ? "#111"
                : "#fff",

            color:
              selectedSector === null
                ? "#fff"
                : "#555",

            fontSize: "14px",
            fontWeight: 600,

            cursor: "pointer",
          }}
        >
          All
        </button>

        {sectorGroups[
          selectedCategory
        ]?.map((sector) => (
          <button
            key={sector}
            onClick={() =>
              setSelectedSector(
                sector
              )
            }
            style={{
              padding: "10px 20px",

              borderRadius:
                "999px",

              border:
                selectedSector ===
                sector
                  ? "none"
                  : "1px solid #d0d0d0",

              background:
                selectedSector ===
                sector
                  ? "#111"
                  : "#fff",

              color:
                selectedSector ===
                sector
                  ? "#fff"
                  : "#555",

              fontSize: "14px",
              fontWeight: 600,

              cursor: "pointer",

              transition:
                "all 0.2s ease",
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* ===================================================== */}
      {/* SVG */}
      {/* ===================================================== */}

      <svg ref={svgRef}></svg>
    </div>
  );
}