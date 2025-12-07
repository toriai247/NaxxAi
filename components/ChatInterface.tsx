import React, { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./chat/MessageBubble";
import { ChatInput } from "./chat/ChatInput";
import { ProfileCard } from "./chat/cards/ProfileCard";
import { TableCard } from "./chat/cards/TableCard";
import { EditProfileCard } from "./chat/cards/EditProfileCard";
import { sendNovaChatRequest, ChatMessage } from "../services/novaService";
import { executeTool } from "../services/toolService";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  image?: string;
  isCard?: boolean; 
  cardData?: any;
  cardType?: string; 
  isError?: boolean;
}

export const ChatInterface = ({ currentUser }: { currentUser: any }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string, image: File | null) => {
    setIsLoading(true);
    
    // 1. Process Input and update UI immediately
    const userMsgId = Date.now().toString();
    const imageBase64 = image ? await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(image);
    }) : undefined;
    
    const displayImage = image ? URL.createObjectURL(image) : undefined;
    setMessages(prev => [...prev, { id: userMsgId, role: "user", text, image: displayImage }]);

    try {
      // 2. Prepare History for Service
      const historyMessages: ChatMessage[] = messages
        .filter(m => !m.isCard && !m.isError)
        .map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.text
        }));

      // Add current message
      const newMessageContent: any = imageBase64 
        ? [
            { type: "text", text },
            { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ]
        : text;

      let conversation: ChatMessage[] = [
        ...historyMessages,
        { role: "user", content: newMessageContent }
      ];

      // 3. Execution Loop (Model -> Tool -> Model)
      let turns = 0;
      const MAX_TURNS = 5;
      let finished = false;

      while (!finished && turns < MAX_TURNS) {
        turns++;
        
        // Call Nova Service
        const message = await sendNovaChatRequest(conversation);
        conversation.push(message);

        // Check for Tool Calls
        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log("Nova Tool Calls:", message.tool_calls);
            
            for (const toolCall of message.tool_calls) {
                const fnName = toolCall.function.name;
                const fnArgs = JSON.parse(toolCall.function.arguments);
                
                // Execute via Tool Service
                let result: any = await executeTool(fnName, fnArgs);

                // UI Feedback for Cards or Errors
                if (result.error) {
                    setMessages(prev => [...prev, {
                      id: `err-${Date.now()}-${Math.random()}`,
                      role: "model",
                      text: `⚠️ **Action Failed (${fnName})**: ${result.error}`,
                      isError: true
                    }]);
                }

                if (result.cardType) {
                    setMessages(prev => [...prev, {
                      id: `card-${Date.now()}-${Math.random()}`,
                      role: "model",
                      text: "",
                      isCard: true,
                      cardType: result.cardType,
                      cardData: result.cardData
                    }]);
                }

                // Append result to conversation history for the model
                conversation.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }
            // Loop continues automatically to get model's reaction to tool output
        } else {
            // Final text response
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: "model", 
                text: message.content || "" 
            }]);
            finished = true;
        }
      }

    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "model", 
        text: `**Connection Error**: ${e.message}`,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderCard = (msg: Message) => {
    if (msg.cardType === 'user_profile') {
      const { title, subtitle, profile, wallet } = msg.cardData;
      return <ProfileCard title={title} subtitle={subtitle} profile={profile} wallet={wallet} />;
    }
    if (msg.cardType === 'table_view') {
      const { title, subtitle, data } = msg.cardData;
      return <TableCard title={title} subtitle={subtitle} data={data} />;
    }
    if (msg.cardType === 'edit_profile_form') {
      return <EditProfileCard currentUser={currentUser} onUpdateComplete={() => {}} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F7] relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-white sticky top-0 z-20 shadow-sm pl-14 md:pl-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B2CC9] to-[#6A30D9] p-0.5 shadow-md group">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#3B2CC9] relative z-10"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" /></svg>
              </div>
           </div>
           <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">Nova 2 Lite</h2>
              <div className="flex items-center gap-1.5">
                 <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`}></span>
                 <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    {isLoading ? 'Processing...' : 'Online'}
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-6 p-8 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#3B2CC9] to-[#6A30D9] flex items-center justify-center shadow-2xl shadow-indigo-200 animate-scale-in">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              </div>
              <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Nova 2 Lite</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                   Powered by Amazon Nova. Your Database Admin & Assistant. I can manage users, adjust balances, configure rewards, and solve system issues automatically.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                   <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-indigo-500 shadow-sm border border-indigo-100">User Control</span>
                   <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-indigo-500 shadow-sm border border-indigo-100">Financial Admin</span>
                   <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-indigo-500 shadow-sm border border-indigo-100">Auto-Fix</span>
                </div>
              </div>
           </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col animate-slide-up ${msg.role === "user" ? "items-end" : "items-start"}`}>
             {!msg.isCard && msg.text && <MessageBubble role={msg.role} text={msg.text} image={msg.image} isError={msg.isError} />}
             {msg.isCard && renderCard(msg)}
             <span className="text-[10px] text-slate-400 px-2 mt-1 font-medium">{new Date(parseInt(msg.id) || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start animate-slide-up">
                <div className="bg-white p-4 rounded-3xl rounded-tl-sm shadow-md border border-white flex gap-2 items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};