import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { GridStack } from "gridstack";
import {
  SubgridContext,
  UpdateLayoutContext,
  RemoveItemFromModelContext,
  AddItemToModelContext,
} from "./contexts";
import getGridOptions from "./utils/getGridOptions";
import cloneDeep from "lodash/cloneDeep";

const GridstackSubgrid = React.forwardRef((props, ref) => {
  const [areChildrenMounted, setAreChildrenMounted] = useState(false);

  const removeItemFromModel = useContext(RemoveItemFromModelContext);
  const addItemToModel = useContext(AddItemToModelContext);

  const getItemElementUsingId = (id) => {
    return subgridRef.current.querySelector(`.grid-stack-item[gs-id="${id}"]`);
  };

  const removeItem = (itemId) => {
    const itemElem = getItemElementUsingId(itemId);
    subgrid.current.removeWidget(itemElem, false); // RemoveDOM = false, don't remove DOM.
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        remove: removeItem,
      };
    },
    // eslint-disable-next-line
    []
  );

  const subgridRef = useRef();
  const isGridDestroyed = useRef();
  const subgrid = useRef();

  const subgridOptions = getGridOptions(props);

  const updateLayout = useContext(UpdateLayoutContext);

  const attachEventListeners = () => {
    subgrid.current.on("added change", (event, items) => {
      for (let item of items) {
        if (!("id" in item)) {
          // The item has been dragged and dropped from outside!
          const { dnd, gridId } = props;
          const { dndItems } = dnd;
          if ("uidGenerator" in dnd) {
            const { x, y, w, h, el } = item;
            const dndItemId = el.getAttribute("gs-dnd-item-id");
            if (dndItemId in dndItems) {
              const dndItem = cloneDeep(dndItems[dndItemId]);
              Object.assign(dndItem, {
                x,
                y,
                w,
                h,
                id: String(dnd.uidGenerator()),
              });
              addItemToModel(dndItem, gridId); // Push item to the layout.
            }
            subgrid.current.removeWidget(item.el, true);
          } else {
            throw new Error(
              "Fatal error: Please supply a UID generator to the grid to support drag and drop of items which doesn't belong to any gridstack grid."
            );
          }
        } else if (false) {
          // The item should not be the part of this grid.
        } else {
          // Item already exists in the layout model.
          updateLayout(item);
        }
      }
    });

    subgrid.current.on("removed", (event, items) => {
      // Don't update the model if the grid is destoryed.
      if (!isGridDestroyed.current) {
        for (let item of items) {
          // Dnd items dont' have id, they have _id!
          if ("id" in item) {
            removeItemFromModel(item.id);
          }
        }
      }
    });
  };
  useEffect(() => {
    if (!areChildrenMounted) {
      const { accept = [], dnd } = props;

      const getDndOptions = () => {
        const { dnd } = props;
        const { options, shredder } = dnd ?? {};
        if (dnd?.class) {
          const gridstackDragAndDropOptions = {
            dragIn: dnd.class,
          };
          if (options) {
            gridstackDragAndDropOptions["dragInOptions"] = options;
          }
          if (shredder) {
            gridstackDragAndDropOptions["removable"] = shredder;
          }
          return gridstackDragAndDropOptions;
        } else {
          return {};
        }
      };

      subgrid.current = GridStack.addGrid(subgridRef.current, {
        ...subgridOptions,
        ...getDndOptions(),
        acceptWidgets: (el) => {
          const classList = new Set(el.classList);
          for (let i = 0; i < accept.length; i++) {
            if (classList.has(accept[i]) || classList.has(dnd?.class ?? "")) {
              return true;
            }
          }
          return false;
        },
      });
      attachEventListeners();
      setAreChildrenMounted(true);
      isGridDestroyed.current = false;
    } else {
      throw new Error(
        "Fatal error: Must not initialize Gridstack subgrid multiple times."
      );
    }
    return () => {
      if (!isGridDestroyed.current) {
        isGridDestroyed.current = true;
        subgrid.current.destroy(false); // Destroy grid but don't remove all the DOM nodes... React will do that for you.
      } else {
        throw new Error(
          "Fatal error: We are trying to destory a subgrid that has already been destroyed."
        );
      }
    };
    // eslint-disable-next-line
  }, []);
  const { children } = props;
  return (
    <SubgridContext.Provider value={subgrid.current}>
      {
        <div className="grid-stack" ref={subgridRef}>
          {areChildrenMounted ? children : null}
        </div>
      }
    </SubgridContext.Provider>
  );
});

export default GridstackSubgrid;
