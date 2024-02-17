import store from "@/app/store";
import getStroke from "perfect-freehand";
import { onLine } from "../Mouse/mouse";
import { setElement } from "../Redux/features/elementSlice";
import { setSelectedElement } from "../Redux/features/selectedElementSlice";



export function addElement(id, x1, y1, x2, y2, type) {

  switch (type) {
    case 'rectangle':
    case "ellipse":
    case 'line':
    case 'diamond':

      return { id, x1, x2, y1, y2, type };



    case "pencil":
      return { id, type, points: [{ x: x1, y: y1 }] };

    case "text":

      return { id, type, x1, y1, x2, y2, text: "" };

    default:

      return { id, x1, x2, y1, y2, type };

  }

}


export const getElementObject = (element) => {

  let { id, x1, y1, x2, y2, type } = element;

  const roughCanvasRef = store.getState().canvas.value;
  const root = roughCanvasRef.generator;

  let elementObject;
  const stroke = element.stroke;
  const fill = element.fill;
  const fillStyle = element.fillStyle;
  const sharp = element.sharp;
  const strokeStyle = element.strokeStyle;
  const strokeWidth = element.strokeWidth;
  const bowing = element.bowing;

  switch (type) {
    case 'rectangle':


      if (!sharp) {
        let minX = Math.min(x1, x2);
        let maxX = Math.max(x1, x2);
        let minY = Math.min(y1, y2);
        let maxY = Math.max(y1, y2);

        x1 = minX;
        y1 = minY;
        x2 = maxX;
        y2 = maxY;

        const w = x2 - x1
        const h = y2 - y1;

        const r = Math.min(w, h) * 0.25;



        elementObject = root.path(`M ${x1 + r} ${y1} L ${x1 + w - r} ${y1} Q ${x1 + w} ${y1}, ${x1 + w} ${y1 + r} L ${x1 + w} ${y1 + h - r
          } Q ${x1 + w} ${y1 + h}, ${x1 + w - r} ${y1 + h} L ${x1 + r} ${y1 + h} Q ${x1} ${y1 + h}, ${x1} ${y1 + h - r
          } L ${x1} ${y1 + r} Q ${x1} ${y1}, ${x1 + r} ${y1}`, { seed: 25, strokeWidth: 3, stroke: stroke, fill: fill, fillStyle: fillStyle, strokeLineDash: strokeStyle, strokeWidth: strokeWidth, bowing: bowing });
      } else {
        elementObject = root.rectangle(x1, y1, x2 - x1, y2 - y1, { seed: 25, strokeWidth: 3, stroke: stroke, fill: fill, fillStyle: fillStyle, strokeLineDash: strokeStyle, strokeWidth: strokeWidth, bowing: bowing });
      }


      break;


    case 'line':
      elementObject = root.line(x1, y1, x2, y2, { seed: 12, strokeWidth: 5, stroke: stroke, fill: fill, fillStyle: fillStyle, strokeLineDash: strokeStyle, strokeWidth: strokeWidth, bowing: bowing });
      break;

    case 'pencil':
      const outlinePoints = getStroke(element.points, { size: strokeWidth * 4 });
      const pathData = getSvgPathFromStroke(outlinePoints);
      const path = new Path2D(pathData);
      elementObject = path;
      break;


    case 'ellipse':
      const centerX = x1 + (x2 - x1) / 2;
      const centerY = y1 + (y2 - y1) / 2;

      elementObject = root.ellipse(centerX,
        centerY,
        x2 - x1,
        (y2 - y1) / 1.1, { seed: 11, strokeWidth: 3, fill: fill, fillStyle: fillStyle, stroke: stroke, strokeLineDash: strokeStyle, strokeWidth: strokeWidth, bowing: bowing }
      );
      break;


    case "diamond":

      const top = [x1 + (x2 - x1) / 2, y1];
      const left = [x1, y1 + (y2 - y1) / 2];
      const bottom = [x1 + (x2 - x1) / 2, y2];
      const right = [x2, y1 + (y2 - y1) / 2];

      const topY = Math.min(top[1], bottom[1]);
      const topX = Math.min(top[0], bottom[0]);
      const rightY = Math.max(right[1], left[1]);
      const rightX = Math.max(right[0], left[0]);
      const bottomX = Math.max(top[0], bottom[0]);
      const bottomY = Math.max(top[1], bottom[1]);
      const leftX = Math.min(left[0], right[0]);
      const leftY = Math.min(left[1], right[1]);


      if (!sharp) {
        elementObject = root.path(`M ${topX + (rightX - topX) * 0.25} ${topY + (rightY - topY) * 0.25
          } L ${rightX - (rightX - topX) * 0.25} ${rightY - (rightY - topY) * 0.25
          } 
      C ${rightX} ${rightY}, ${rightX} ${rightY}, ${rightX - (rightX - bottomX) * 0.25
          } ${rightY + (bottomY - rightY) * 0.25} 
      L ${bottomX + (rightX - bottomX) * 0.25} ${bottomY - (bottomY - rightY) * 0.25
          }  
      C ${bottomX} ${bottomY}, ${bottomX} ${bottomY}, ${bottomX - (bottomX - leftX) * 0.25
          } ${bottomY - (bottomY - leftY) * 0.25} 
      L ${leftX + (bottomX - leftX) * 0.25} ${leftY + (bottomY - leftY) * 0.25
          } 
      C ${leftX} ${leftY}, ${leftX} ${leftY}, ${leftX + (topX - leftX) * 0.25
          } ${leftY - (leftY - topY) * 0.25} 
      L ${topX - (topX - leftX) * 0.25} ${topY + (leftY - topY) * 0.25} 
      C ${topX} ${topY}, ${topX} ${topY}, ${topX + (rightX - topX) * 0.25
          } ${topY + (rightY - topY) * 0.25}`, { seed: 17, fill: 'grey', fillStyle: "solid", stroke: stroke, fill: fill, fillStyle: fillStyle, strokeLineDash: strokeStyle, strokeWidth: strokeWidth, bowing: bowing });
      } else {



        elementObject = root.polygon([top, left, bottom, right], { seed: 17, fill: 'grey', fillStyle: "solid", stroke: stroke, fill: fill, fillStyle: fillStyle, strokeLineDash: strokeStyle, strokeWidth: strokeWidth, bowing: bowing });
      }




      break;
    default:
      elementObject = root.line(x1, y1, x2, y2, { seed: 6 });
      break;

  }
  return elementObject;

}

export const getElementBelow = (event, selectedElement, scale) => {
  const histIndex = store.getState().elements.index;
  const elements = store.getState().elements.value[histIndex];

  for (var i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    const { x1, y1, x2, y2, type } = element;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    let found = false;


    if (selectedElement != null && selectedElement.type != 'line') {

      const { x1, y1, x2, y2 } = elements[selectedElement.id];

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      if (event.clientX > minX - 15 && event.clientX < maxX + 15 && event.clientY > minY - 15 && event.clientY < maxY + 15) {

        return elements[selectedElement.id];
      }


    }


    switch (type) {
      case "ellipse":
      case "rectangle":
      case "diamond":
      case "text":

        if (event.clientX > minX - 15 / scale && event.clientX < maxX + 15 && event.clientY > minY - 15 && event.clientY < maxY + 15) {
          found = true;
        }
        break;

      case "line":


        const total_length = Math.sqrt((Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)));
        const initial = Math.sqrt((Math.pow(y1 - event.clientY, 2) + Math.pow(x1 - event.clientX, 2)));
        const final = Math.sqrt((Math.pow(y2 - event.clientY, 2) + Math.pow(x2 - event.clientX, 2)));

        const diff = Math.abs(total_length - (initial + final));


        if (diff < 5) {
          found = true;

        }


        break;

      case "pencil":
        const betweenAnyPoint = element.points.some((point, index) => {

          const nextPoint = element.points[index + 1];

          if (nextPoint === undefined) {
            return;
          }
          return onLine(point.x, point.y, nextPoint.x, nextPoint.y, event, 5) != false;

        });

        if (betweenAnyPoint) {
          found = true;
        }
        break;

      default:

        break;


    }
    if (found) {

      return element;

    }
  }
}


// updates the old element with new one having new props or any change
export const updateElement = (id, x1, y1, x2, y2, type, options) => {

  const histIndex = store.getState().elements.index;
  const elements = store.getState().elements.value[histIndex];
  const action = store.getState().action.value;
  const tempNewArray = [...elements];



  switch (type) {
    case "line":
    case "rectangle":
    case "ellipse":
    case "diamond":


      let { id: elementId, x1: elementX1, y1: elementY1, x2: elementX2, y2: elementY2, type: elementType, ...otherProps } = elements[id];
      const updatedElement = { ...addElement(id, x1, y1, x2, y2, type), ...otherProps }



      tempNewArray[id] = updatedElement;




      if (action === 'drawing') {
        store.dispatch(setSelectedElement(updatedElement));
      }
      break;

    case "pencil":


      let { id: pencilId, x1: pencilX1, y1: pencilY1, x2: pencilX2, y2: pencilY2, type: pencilType, points: pencilPoints, ...otherPencilProps } = elements[id];

      tempNewArray[id] = {
        ...tempNewArray[id],
        points: [...tempNewArray[id].points, { x: x2, y: y2 }], ...otherPencilProps
      };
      break;


    case "text":

      const context = document.getElementById("canvas").getContext('2d');
      context.font = `${elements[id].fontSize}px Virgil`;

      let { id: textId, x1: textX1, y1: textY1, x2: textX2, y2: textY2, type: textType, text: textStrign, ...otherTextProps } = elements[id];

      let textWidth = x1;
      let textHeight = y1;

      var txt = options.text;
      var lines = txt.split('\n');
      var linesLength = lines.length;

      var textWidthVar = 0;
      for (let i = 0; i < linesLength; i++) {
        const line = lines[i];
        textWidthVar = Math.max(textWidthVar, context.measureText(line).width)
      }


      textWidth += textWidthVar;
      textHeight = textHeight + (linesLength) * (elements[id].fontSize + 6);

      if (store.getState().action.value === 'resizing') {
        tempNewArray[id] = { ...addElement(id, x1, y2, x2, textHeight, type), text: options.text, ...otherTextProps }
      } else {
        tempNewArray[id] = { ...addElement(id, x1, y1, textWidth, textHeight, type), text: options.text, ...otherTextProps }
      }



      break;

    default:
      break;
  }

  store.dispatch(setElement([tempNewArray, true]));





}





export const adjustElementCoordinates = element => {
  const { id, type, x1, y1, x2, y2 } = element;
  if (type === "rectangle" || type === 'ellipse' || type === 'diamond') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { id, x1: minX, y1: minY, x2: maxX, y2: maxY, type };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { id, x1: x1, y1: y1, x2: x2, y2: y2, type };
    } else {
      return { id, x1: x2, y1: y2, x2: x1, y2: y1, type };
    }
  }
};


const average = (a, b) => (a + b) / 2


function getSvgPathFromStroke(points) {
  const len = points.length

  if (!len) {
    return ''
  }

  const first = points[0]
  let result = `M${first[0].toFixed(3)},${first[1].toFixed(3)}Q`

  for (let i = 0, max = len - 1; i < max; i++) {
    const a = points[i]
    const b = points[i + 1]
    result += `${a[0].toFixed(3)},${a[1].toFixed(3)} ${average(
      a[0],
      b[0]
    ).toFixed(3)},${average(a[1], b[1]).toFixed(3)} `
  }

  result += 'Z'

  return result
}

