import React, { useEffect, useRef, useState } from "react";
import { JsonView, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import {
  GridstackContainer,
  GridstackItem,
  GridstackSubgrid,
} from "../gridstack";
import { MapWidget, CalendarWidget } from "./widgets";
import styles from "./styles.module.css";

function Dev() {
  const savedLayout = JSON.parse(localStorage.getItem("layout"));
  const [layout, setLayout] = useState(
    savedLayout ?? [
      {
        id: "1",
        x: 0,
        y: 3,
        w: 2,
        h: 2,
        data: {
          type: "calendar",
          title: "A calendar widget",
          data: 1685811196713,
        },
      },
      {
        id: "2",
        x: 0,
        y: 0,
        w: 2,
        h: 3,
        children: [
          {
            id: "3",
            x: 1,
            y: 0,
            w: 9,
            h: 1,
            data: {
              type: "map",
              title: "A map widget",
              data: "Chennai, Tamil Nadu, India",
            },
          },
          {
            id: "4",
            x: 1,
            y: 1,
            w: 8,
            h: 1,
            data: {
              type: "map",
              title: "A map widget",
              data: "Chennai, Tamil Nadu, India",
            },
          },
        ],
      },
      {
        id: "5",
        x: 0,
        y: 0,
        w: 2,
        h: 3,
        children: [
          {
            id: "6",
            x: 1,
            y: 0,
            w: 9,
            h: 1,
            data: {
              type: "map",
              title: "A map widget",
              data: "Chennai, Tamil Nadu, India",
            },
          },
          {
            id: "7",
            x: 1,
            y: 1,
            w: 8,
            h: 1,
            data: {
              type: "map",
              title: "A map widget",
              data: "Chennai, Tamil Nadu, India",
            },
          },
        ],
      },
    ]
  );
  const [gridstackContainerVisibility, setGridstackContainerVisibility] =
    useState(true);

  useEffect(() => {
    layoutChanged();
    return () => {
      // perform cleanup here if necessary
      console.log("Dev.jsx will unmount!");
    };
    // eslint-disable-next-line
  }, [layout]); // empty dependency array to ensure it only runs once

  // const widgetStyles = {
  //   border: "1px solid red",
  //   margin: "10px",
  // };

  const remove = (id, gridId) => {
    gridsRef.current[gridId].remove(id);
  };

  const getWidget = ({ type, data, id, gridId } = {}) => {
    if (type === "calendar") {
      return <CalendarWidget data={data} remove={() => remove(id, gridId)} />;
    } else if (type === "map") {
      return <MapWidget data={data} remove={() => remove(id, gridId)} />;
    }
  };

  const getItem = ({ item, gridId = "master" } = {}) => {
    const {
      data,
      data: { type },
      id,
    } = item ?? {};
    const widget = getWidget({ type, data, id, gridId });
    return (
      <GridstackItem
        className="gs-widget"
        key={item.id}
        id={item.id}
        x={item.x}
        y={item.y}
        w={item.w}
        h={item.h}
      >
        {widget}
      </GridstackItem>
    );
  };

  const layoutChanged = () => {
    localStorage.setItem("layout", JSON.stringify(layout));
  };

  const showHideGridstackContainer = () => {
    setGridstackContainerVisibility((visibility) => !visibility);
  };

  const gridsRef = useRef([]);
  const createRef = (el, id) => {
    gridsRef.current[id] = el;
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["gs-container"]}>
        {gridstackContainerVisibility && (
          <GridstackContainer
            ref={(el) => createRef(el, "master")}
            setLayout={setLayout}
            columns={2}
            rowHeight={100}
            layoutChanged={layoutChanged}
            accept={["gs-subgrid"]}
          >
            {layout.map((item) => {
              if ("children" in item) {
                // is a subgrid!
                const { children, id: gridId } = item;
                return (
                  <GridstackItem
                    key={item.id}
                    id={item.id}
                    x={item.x}
                    y={item.y}
                    w={item.w}
                    h={item.h}
                    className="gs-subgrid"
                  >
                    <GridstackSubgrid
                      accept={["gs-widget"]}
                      items={children}
                      key={gridId}
                      ref={(el) => createRef(el, gridId)}
                    >
                      {children.map((child) => {
                        return getItem({ item: child, gridId: gridId });
                      })}
                    </GridstackSubgrid>
                  </GridstackItem>
                );
              } else {
                return getItem({ item });
              }
            })}
          </GridstackContainer>
        )}
      </div>
      <div className={styles["controls-container"]}>
        <button onClick={showHideGridstackContainer}>
          Show / Hide Gridstack Container
        </button>
        <button onClick={() => localStorage.clear("layout")}>
          Clear localStorage
        </button>
        <button onClick={() => console.log(layout)}>console.log(layout)</button>
      </div>
      <div className={styles["json-viewer"]}>
        <JsonView data={layout} style={darkStyles} />
      </div>
    </div>
  );
}
export default Dev;
