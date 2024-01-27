
import { useEffect } from 'react';
import { FaCircle, FaPencilAlt, FaRedo, FaSlash, FaSquare, FaUndo } from "react-icons/fa";
import { FaDiamond } from "react-icons/fa6";
import { IoMove } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { redo, undo } from '../Redux/features/elementSlice';
import { changeTool } from '../Redux/features/toolSlice';
import ButtonComponent from './ButtonComponent';
import { setSelectedElement } from '../Redux/features/selectedElementSlice';

const buttons = [
  { tooltip: 'Rectangle', icon: FaSquare, shortcut: '1', tool: 'rect' },
  { tooltip: 'Line', icon: FaSlash, shortcut: '2', tool: 'line' },
  { tooltip: 'Selection', icon: IoMove, shortcut: '3', tool: 'selection' },
  { tooltip: 'Pencil', icon: FaPencilAlt, shortcut: '4', tool: 'pencil' },
  { tooltip: 'Ellipse', icon: FaCircle, shortcut: '5', tool: 'ellipse' },
  { tooltip: 'Diamond', icon: FaDiamond, shortcut: '6', tool: 'diamond' }

];

const Topbar = () => {

  const dispath = useDispatch();
  const toolIndex = useSelector(state => state.tool.index);
  
// keyboard handler 
  useEffect(() => {
    const handler = (event) => {
      console.log(event.key);
    
      if (event.key === '1') {
        dispath(changeTool("rect"));
         
      } else if (event.key === '2') {
        dispath(changeTool("line"));
      
      } else if (event.key === '3') {
        dispath(changeTool("selection"));
        
      } else if (event.key === '4') {
      
        dispath(changeTool("pencil"));
     
      } else if(event.key === '5') {
        dispath(changeTool('ellipse'))
      }
      else if(event.key === '6') {
        dispath(changeTool('diamond'))
      }
      
      else if ((event.key === 'z' || event.key === 'Z') && (event.ctrlKey || event.metaKey) && event.shiftKey) {
        dispath(setSelectedElement(null));
        dispath(redo());

      } else if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
        dispath(setSelectedElement(null));
        dispath(undo());
      }


    }
    if (typeof window !== 'undefined') {

      window.addEventListener("keydown", handler);
    }

    return () => window.removeEventListener("keydown", handler)
  });

  
// mouse wheel handler 
  useEffect(() => {
    
    onwheel = (event) => {
      
 
      let currentTool;
      if(event.deltaY > 100){

     
        currentTool = (toolIndex + 1) % 7;
      
      } else{
        currentTool = (toolIndex - 1) === 0 ? buttons.length : toolIndex - 1;
      }

      console.log(`before ${currentTool} ${toolIndex}`);
      currentTool = currentTool === 0 ? 1 : currentTool;
     
    
      switch(currentTool) {
        case 1:
          dispath(changeTool("rect"));
          break;

        case 2:
          dispath(changeTool("line"));
          
          break;
        case 3 :
          dispath(changeTool("selection"));
          break;
        case 4 :
          dispath(changeTool("pencil"));
          break;

        case 5:
          dispath(changeTool("ellipse"));
          break;

        case 6:
            dispath(changeTool("diamond"));
            break;
          
          default:
            break;

      } 
    };
   
  })
  



  return (
    <div className='flex flex-row absolute left-1/2 transform -translate-x-1/2'>

      {buttons.map((button, index) =>

      (
        <div key={index} onClick={() => dispath(changeTool(buttons[index].tool))}>  <ButtonComponent button={button} /> </div>

      )

      )}

      <button onClick={() =>{ 
        
        dispath(setSelectedElement(null));
        dispath(undo());}} className={`rounded-md p-4 m-2   bg-[#9c83ee] border-2 text-[#200E3A] relative `}>
        <span className=""><FaUndo /></span>
        <span className="absolute bottom-0 right-0 text-white p-1 rounded">
          {'7'}
        </span>
      </button>
      <button onClick={() => {
        
        dispath(setSelectedElement(null));
        dispath(redo())}} className={`rounded-md p-4 m-2   bg-[#9c83ee] border-2 text-[#200E3A] relative `}>
        <span className=""><FaRedo /></span>
        <span className="absolute bottom-0 right-0 text-white p-1 rounded">
          {'8'}
        </span>
      </button>
    </div>
  )
}

export default Topbar