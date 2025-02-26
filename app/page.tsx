"use client";
import Image from "next/image";
import logo from "./assets/logo.png";
import Bubble from "./Component/Bubble";
import LoadingBubble from "./Component/LoadingBubble";
import PromptSuggestionRow from "./Component/PromptSuggestionRow";

import { useChat } from "ai/react";
import { Message } from "ai";
import { useEffect, useRef } from "react";

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Trigger effect when 'messages' changes

  const noMessages = !messages || messages.length===0;
  const handlePrompt=(promptText)=>{
    const msg:Message={
      id:crypto.randomUUID(),
      content: promptText,
      role: "user"
    }
    append(msg)
  }
  return (
    <main>
      <div style={{display:"flex",alignItems:"center"}}>
      <Image src={logo} width={150} alt="F1GPT Logo" />
      <h1>ChessGPT</h1>
      </div>
      
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
            Welcome to the ultimate destination for Chess lovers! Ask ChessGPT anything about the world of chess, from strategies to famous games, and get up-to-date, expert answers. We hope you enjoy!
            </p>
            <br />
            <PromptSuggestionRow onPromptClick={handlePrompt}/>
          </>
        ) : (
          <>
            {/* {messages.map((messages,index)=><Bubble key={`message-${index}`} message={messages}/>)}
            {isLoading && <LoadingBubble/>} */}
            <div className="scrollDiv" >
              {messages.map((messages,index)=><Bubble key={`message-${index}`} message={messages}/>)}
            {isLoading && <LoadingBubble/>}
            <div ref={endOfMessagesRef} />
            </div>
          </>
        )}
      </section>
      <div className="form-div">

      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
        />
        <input type="submit" />
      </form>
      </div>
    </main>
  );
};
export default Home;
