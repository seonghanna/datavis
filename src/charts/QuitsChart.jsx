import * as d3 from "d3";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function QuitsChart() {
  const svgRef = useRef();
  const wrapperRef = useRef();

  const [isVisible, setIsVisible] =
    useState(false);

  // =====================================
  // INTERSECTION OBSERVER
  // =====================================

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setIsVisible(
            entry.isIntersecting
          );
        },
        {
          threshold: 0.45,
        }
      );

    if (wrapperRef.current) {
      observer.observe(
        wrapperRef.current
      );
    }

    return () => observer.disconnect();
  }, []);

  // =====================================
  // LOAD DATA
  // =====================================

  useEffect(() => {
    d3.csv("/data/JOLTS.csv").then(
      (data) => {
        const parsed = data
          .filter(
            (d) =>
              d.series_id ===
                "JTS000000000000000QUR" &&
              d.period.startsWith("M")
          )
          .map((d) => ({
            date: new Date(
              +d.year,
              +d.period.replace(
                "M",
                ""
              ) -
                1
            ),
            value: +d.value,
          }))
          .filter(
            (d) =>
              d.date >=
              new Date(2018, 0)
          );

        drawChart(parsed);
      }
    );
  }, [isVisible]);

  // =====================================
  // DRAW CHART
  // =====================================

  const drawChart = (data) => {
    d3.select(svgRef.current)
      .selectAll("*")
      .remove();

    const width = 1500;
    const height = 850;

    const margin = {
      top: 110,
      right: 120,
      bottom: 70,
      left: 100,
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // =====================================
    // SCALE
    // =====================================

    const x = d3
      .scaleTime()
      .domain(
        d3.extent(data, (d) => d.date)
      )
      .range([
        margin.left,
        width - margin.right,
      ]);

    const y = d3
      .scaleLinear()
      .domain([1.45, 3.25])
      .range([
        height - margin.bottom,
        margin.top,
      ]);

    // =====================================
    // GRID
    // =====================================

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
      .selectAll("line")
      .attr("stroke", "#d9d9d9");

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
          .tickSize(
            -(
              height -
              margin.top -
              margin.bottom
            )
          )
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#d9d9d9");

    // =====================================
    // AXIS
    // =====================================

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

    // =====================================
    // TITLE
    // =====================================

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 42)
      .attr("text-anchor", "middle")
      .style("font-size", "30px")
      .style("font-weight", "700")
      .text(
        "JOLTS Quits Rate (Total Nonfarm)"
      );

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 78)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("fill", "#777")
      .text(
        "Workers voluntarily left jobs at record levels during the Great Resignation"
      );

    // =====================================
    // Y LABEL
    // =====================================

    svg
      .append("text")
      .attr(
        "transform",
        "rotate(-90)"
      )
      .attr("x", -height / 2)
      .attr("y", 40)
      .style("font-size", "18px")
      .text(
        "Quits Rate (% of total employment)"
      );

    // =====================================
    // LEGEND
    // =====================================

    svg
      .append("line")
      .attr("x1", 115)
      .attr("x2", 155)
      .attr("y1", 95)
      .attr("y2", 95)
      .attr("stroke", "#df2f2f")
      .attr("stroke-width", 4);

    svg
      .append("text")
      .attr("x", 175)
      .attr("y", 101)
      .style("font-size", "18px")
      .text("Quits Rate");

    // =====================================
    // AVERAGE LINE
    // =====================================

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr(
        "x2",
        width - margin.right
      )
      .attr("y1", y(2.3))
      .attr("y2", y(2.3))
      .attr("stroke", "#999")
      .attr("stroke-dasharray", "4 4")
      .style("opacity", 0)
      .transition()
      .delay(500)
      .duration(800)
      .style("opacity", 1);

    svg
      .append("text")
      .attr("x", 210)
      .attr("y", y(2.3) - 10)
      .style("fill", "#666")
      .style("font-size", "16px")
      .style("opacity", 0)
      .text(
        "2018-19 average (2.3%)"
      )
      .transition()
      .delay(900)
      .duration(800)
      .style("opacity", 1);

    // =====================================
    // GPT RELEASE
    // =====================================

    const gptDate = new Date(2022, 10);

    const gptX = x(gptDate);

    const gptLine = svg
      .append("line")
      .attr("x1", gptX)
      .attr("x2", gptX)
      .attr("y1", margin.top)
      .attr("y2", margin.top)
      .attr("stroke", "#888")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 5");

    gptLine
      .transition()
      .delay(2600)
      .duration(1200)
      .attr(
        "y2",
        height - margin.bottom
      );

    svg
      .append("text")
      .attr("x", gptX + 18)
      .attr("y", 155)
      .style("fill", "#777")
      .style("font-size", "18px")
      .style("opacity", 0)
      .text("ChatGPT release")
      .transition()
      .delay(3600)
      .duration(900)
      .style("opacity", 1);

    svg
      .append("text")
      .attr("x", gptX + 18)
      .attr("y", 185)
      .style("fill", "#777")
      .style("font-size", "18px")
      .style("opacity", 0)
      .text("(Nov 2022)")
      .transition()
      .delay(3800)
      .duration(900)
      .style("opacity", 1);

    // =====================================
    // SHADED AREA
    // =====================================

    svg
      .append("rect")
      .attr("x", gptX)
      .attr("y", margin.top)
      .attr(
        "width",
        width -
          margin.right -
          gptX
      )
      .attr(
        "height",
        height -
          margin.top -
          margin.bottom
      )
      .attr("fill", "#ef4444")
      .attr("opacity", 0)
      .transition()
      .delay(3200)
      .duration(1000)
      .attr("opacity", 0.05);

    // =====================================
    // MAIN LINE
    // =====================================

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#df2f2f")
      .attr("stroke-width", 5)
      .attr("d", line);

    const totalLength =
      path.node().getTotalLength();

    if (isVisible) {
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
        .duration(2800)
        .ease(d3.easeCubicOut)
        .attr(
          "stroke-dashoffset",
          0
        );
    }

    // =====================================
    // CURVED DECLINE ARROW
    // =====================================

    const arrow = svg
      .append("path")
      .attr(
        "d",
        `
        M ${x(new Date(2022, 9))} ${y(2.92)}
        C ${x(new Date(2023, 4))} ${y(2.82)},
          ${x(new Date(2024, 2))} ${y(2.48)},
          ${x(new Date(2025, 5))} ${y(2.08)}
      `
      )
      .attr("fill", "none")
      .attr("stroke", "#ff3b1a")
      .attr("stroke-width", 8)
      .attr("stroke-linecap", "round")
      .attr("opacity", 0.9);

    const arrowLength =
      arrow.node().getTotalLength();

    arrow
      .attr(
        "stroke-dasharray",
        arrowLength
      )
      .attr(
        "stroke-dashoffset",
        arrowLength
      )
      .transition()
      .delay(4300)
      .duration(1800)
      .ease(d3.easeCubicOut)
      .attr(
        "stroke-dashoffset",
        0
      );

    // arrow head
    const arrowHead =
      svg.append("path");

    arrowHead
      .attr(
        "d",
        `
        M ${x(new Date(2025, 5)) - 35} ${y(2.16)}
        L ${x(new Date(2025, 5))} ${y(2.08)}
        L ${x(new Date(2025, 5)) - 12} ${y(2.28)}
      `
      )
      .attr("fill", "none")
      .attr("stroke", "#ff3b1a")
      .attr("stroke-width", 8)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0);

    arrowHead
      .transition()
      .delay(5900)
      .duration(500)
      .attr("opacity", 1);

    // =====================================
    // DECLINE TEXT
    // =====================================

    svg
      .append("text")
      .attr(
        "x",
        x(new Date(2024, 9))
      )
      .attr(
        "y",
        y(2.05)
      )
      .style("font-size", "22px")
      .style("font-weight", "700")
      .style("fill", "#6f1e1e")
      .style("opacity", 0)
      .text(
        "Workers stopped quitting"
      )
      .transition()
      .delay(6200)
      .duration(1000)
      .style("opacity", 0.9);

    // =====================================
    // PEAK ANNOTATION
    // =====================================

    const peak = data.find(
      (d) =>
        d.date.getFullYear() ===
          2021 &&
        d.date.getMonth() === 10
    );

    svg
      .append("text")
      .attr(
        "x",
        x(peak.date) - 270
      )
      .attr(
        "y",
        y(3.0) + 50
      )
      .style("fill", "#ef4444")
      .style("font-size", "22px")
      .style("font-weight", "700")
      .style("opacity", 0)
      .text(
        "Great Resignation peak"
      )
      .transition()
      .delay(2100)
      .duration(1000)
      .attr(
        "y",
        y(3.0) + 35
      )
      .style("opacity", 1);

    svg
      .append("text")
      .attr(
        "x",
        x(peak.date) - 260
      )
      .attr(
        "y",
        y(3.0) + 80
      )
      .style("fill", "#ef4444")
      .style("font-size", "20px")
      .style("opacity", 0)
      .text("3.0% (Nov 2021)")
      .transition()
      .delay(2400)
      .duration(1000)
      .attr(
        "y",
        y(3.0) + 65
      )
      .style("opacity", 1);

    svg
      .append("line")
      .attr(
        "x1",
        x(peak.date) - 10
      )
      .attr(
        "y1",
        y(3.0) + 5
      )
      .attr(
        "x2",
        x(peak.date) - 150
      )
      .attr(
        "y2",
        y(3.0) + 40
      )
      .attr("stroke", "#f28b8b")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .delay(2600)
      .duration(800)
      .style("opacity", 1);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        justifyContent: "center",
        marginTop: "120px",
        marginBottom: "180px",
      }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
}