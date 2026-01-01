import { Message } from "@shared/schema";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import hectorAvatar from "@assets/image_1761123466101.png";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2 md:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in slide-in-from-bottom-2 duration-150`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-primary shrink-0" data-testid="avatar-hector">
          <AvatarImage src={hectorAvatar} alt="Hector" className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4 md:w-5 md:h-5" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-3 py-3 md:px-6 md:py-4 rounded-2xl ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-card-border shadow-sm"
          }`}
          data-testid={`text-message-content`}
        >
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        <span className="text-xs text-muted-foreground px-2" data-testid="text-timestamp">
          {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-border shrink-0" data-testid="avatar-user">
          <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-xs md:text-sm">
            Vous
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
