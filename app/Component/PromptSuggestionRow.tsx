import { index } from "langchain/indexes";
import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({onPromptClick}) => {
  const prompts = [
    "Who is the current World Chess Champion?",
"Who is the highest-rated chess player in the world?",
"Who is the youngest grandmaster in history?",
"What were the most famous matches in chess history?",
"What is the Elo rating system, and how is it calculated?",
"What are the emerging trends in chess?",
"What is the best opening for beginners in chess?"
  ];
  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton key={`suggestion-${index}`} text={prompt}
        onClick={()=>onPromptClick(prompt)} />
      ))}
    </div>
  );
};
export default PromptSuggestionRow;
