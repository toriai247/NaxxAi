import React, { useRef, useState, useEffect } from "react";

interface ChatInputProps {
  onSend: (text: string, image: File | null) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'; 
    }
  }, [inputValue]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setIsMenuOpen(false); 
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  }

  const handleSubmit = () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;
    
    onSend(inputValue, selectedImage);
    
    setInputValue("");
    setSelectedImage(null);
    setImagePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
      {/* Attachment Shelf (Slide Up) */}
      {imagePreview && (
        <div className="absolute bottom-full left-4 right-4 mb-2 animate-slide-up">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 w-fit mx-auto md:mx-0">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={imagePreview} className="w-full h-full object-cover" />
              </div>
              <div className="pr-2">
                <div className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{selectedImage?.name}</div>
                <div className="text-[10px] text-slate-500">{(selectedImage!.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={removeImage} className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
              </button>
          </div>
        </div>
      )}

      {/* Expanded Menu */}
      {isMenuOpen && (
          <div className="absolute bottom-24 right-4 flex flex-col gap-4 items-end mb-2 z-40">
            <label className="flex items-center gap-3 animate-spring origin-bottom-right" style={{animationDelay: '0.1s'}}>
                <span className="bg-white/90 backdrop-blur text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Picture</span>
                <div className="w-14 h-14 rounded-full bg-white shadow-xl text-[#6A30D9] flex items-center justify-center cursor-pointer active:scale-95 transition ring-1 ring-slate-100">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                </div>
            </label>
            <div className="flex items-center gap-3 animate-spring origin-bottom-right" style={{animationDelay: '0.05s'}}>
                <span className="bg-white/90 backdrop-blur text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Video</span>
                <div className="w-14 h-14 rounded-full bg-white shadow-xl text-[#8D4DFF] flex items-center justify-center cursor-pointer active:scale-95 transition ring-1 ring-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                </div>
            </div>
          </div>
      )}
      
      {/* Input Pill */}
      <div className="w-full max-w-4xl mx-auto glass-card rounded-[2rem] p-2 pl-3 flex items-end shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] border border-white/60">
          
          <button 
            type="button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 mb-1 ${isMenuOpen ? 'bg-slate-100 rotate-45 text-slate-600' : 'bg-slate-50 text-[#3B2CC9] hover:bg-indigo-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <div className="flex-1 flex items-end gap-2 ml-2 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 font-medium text-[16px] resize-none max-h-32 py-3 overflow-y-auto custom-scrollbar leading-relaxed" 
            />
            <button 
              onClick={handleSubmit}
              disabled={isLoading || (!inputValue && !selectedImage)}
              className="p-3 bg-gradient-to-r from-[#3B2CC9] to-[#6A30D9] text-white rounded-full shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 m-1 mb-1.5"
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transform rotate-0 ml-0.5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
          </div>
      </div>
    </div>
  );
};