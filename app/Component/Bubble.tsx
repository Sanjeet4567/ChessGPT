import Markdown from "react-markdown"
const Bubble=({message})=>{

    const {content,role}=message
    return(
        <div className={`${role} bubble `}>
            <div >
            <Markdown >{content}</Markdown>
            </div>
            
            
        </div>
    )
}
export default Bubble