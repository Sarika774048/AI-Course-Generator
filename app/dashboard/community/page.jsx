"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Pusher from "pusher-js";
import { format } from "date-fns";
import { 
  Send, Paperclip, Loader2, Image as ImageIcon, FileText, 
  Download, ExternalLink, Sparkles, Menu, X, Link as LinkIcon, 
  UserPen, Camera 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label"

// 1. IMPORT UPLOADTHING HELPERS
import { generateReactHelpers } from "@uploadthing/react";

// 2. INITIALIZE HOOK
const { useUploadThing } = generateReactHelpers();

const Community = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Link Dialog
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  // Profile Dialog
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  
  // User & Hydration
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); 
  const avatarInputRef = useRef(null); // Ref for profile picture upload
  
  // 3. CONFIGURE UPLOADTHING
  const { startUpload, isUploading } = useUploadThing("chatAttachment", {
    onClientUploadComplete: (res) => {
      const file = res[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      sendMessage("file", file.url, file.name, `${sizeInMB} MB`);
    },
    onUploadError: (error) => {
      alert(`Upload Failed: ${error.message}`);
    },
  });

  // Separate UploadThing hook just for Avatars (to keep logic clean)
  const { startUpload: startAvatarUpload, isUploading: isAvatarUploading } = useUploadThing("chatAttachment", {
    onClientUploadComplete: (res) => {
      const file = res[0];
      // Update User State
      const updatedUser = { ...user, avatar: file.url };
      setUser(updatedUser);
      localStorage.setItem("chat_user", JSON.stringify(updatedUser));
    },
    onUploadError: (error) => {
      alert(`Avatar Update Failed: ${error.message}`);
    },
  });

  // --- INITIAL SETUP ---
  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("chat_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditName(parsedUser.name); // Pre-fill edit input
    } else {
      const newUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: "Student_" + Math.floor(Math.random() * 1000),
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${Math.floor(Math.random() * 1000)}`
      };
      localStorage.setItem("chat_user", JSON.stringify(newUser));
      setUser(newUser);
      setEditName(newUser.name);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY; 
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (pusherKey && pusherCluster) {
        const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const channel = pusher.subscribe("community-channel");
        channel.bind("new-message", (data) => setMessages((prev) => [...prev, data]));
        return () => { channel.unbind_all(); channel.unsubscribe(); };
    }
  }, [mounted]);

  // --- SEND MESSAGE FUNCTION ---
  const sendMessage = async (type = "text", content = null, fileName = null, fileSize = null) => {
    const finalContent = content || inputMessage;
    if (!finalContent.trim() || !user) return;

    let fileType = "text";
    if (type === "file") {
        fileType = fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? "image" : "file";
    } else if (type === "link") {
        fileType = "link";
    }

    let formattedSize = fileSize;
    if (typeof fileSize === 'number') {
        formattedSize = (fileSize / 1024 / 1024).toFixed(2) + " MB";
    }

    setLoading(true);
    try {
      await fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalContent,
          sender: user.name,
          senderId: user.id,
          avatar: user.avatar,
          isFile: type !== "text",
          fileType: fileType,
          fileName: fileName || "Shared Link",
          fileSize: formattedSize,
          timestamp: new Date().toISOString()
        }),
      });
      setInputMessage("");
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // --- HANDLERS ---
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) startUpload(files);
  };

  const handleAvatarSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) startAvatarUpload(files);
  };

  const saveProfile = () => {
    if (!editName.trim()) return;
    const updatedUser = { ...user, name: editName };
    setUser(updatedUser);
    localStorage.setItem("chat_user", JSON.stringify(updatedUser));
    setIsProfileOpen(false);
  };

  const openUrl = (url) => window.open(url, "_blank");

  const sharedResources = messages.filter(msg => msg.isFile);

  if (!mounted || !user) return <div className="flex items-center justify-center h-[80vh] bg-slate-50 rounded-xl"><Loader2 className="animate-spin text-purple-600 h-10 w-10"/></div>;

  return (
    <div className="h-[calc(100vh-80px)] w-full p-4 bg-white flex gap-6 overflow-hidden relative font-sans text-slate-800">
      
      {/* --- CHAT CONTAINER --- */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
          
          {/* HEADER */}
          <div className="h-20 px-6 flex items-center justify-between bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 shadow-lg shrink-0">
             <div className="flex items-center gap-4">
                <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-white hover:bg-white/20 p-2 rounded-full transition">
                    <Menu size={24}/>
                </button>

                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/30 text-white shadow-inner">
                  <Sparkles size={24} className="text-yellow-300 fill-yellow-300"/>
                </div>
                <div className="flex flex-col text-white">
                  <h2 className="font-bold text-xl flex items-center gap-2 tracking-tight">
                    Community Chat
                  </h2>
                  <p className="text-xs text-purple-100 font-medium opacity-90">Powered by UploadThing</p>
                </div>
             </div>

             {/* --- USER PROFILE (CLICK TO EDIT) --- */}
             <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
               <DialogTrigger asChild>
                 <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full border border-white/20 cursor-pointer transition-all group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white group-hover:underline decoration-white/50 underline-offset-2">{user.name}</p>
                        <p className="text-[10px] text-green-300 font-bold opacity-80">Edit Profile</p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                        <AvatarImage src={user.avatar} className="object-cover" />
                        <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                 </div>
               </DialogTrigger>
               
               {/* --- PROFILE EDIT DIALOG --- */}
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Edit Profile</DialogTitle>
                   <DialogDescription>
                     Make changes to your profile here. Click save when you're done.
                   </DialogDescription>
                 </DialogHeader>
                 
                 <div className="flex flex-col items-center gap-6 py-4">
                    {/* Avatar Upload */}
                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current.click()}>
                        <input type="file" className="hidden" ref={avatarInputRef} onChange={handleAvatarSelect} accept="image/*"/>
                        <Avatar className="h-24 w-24 border-4 border-purple-100 shadow-xl">
                            <AvatarImage src={user.avatar} className="object-cover" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            {isAvatarUploading ? <Loader2 className="animate-spin text-white"/> : <Camera className="text-white"/>}
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Click image to change</p>

                    {/* Name Input */}
                    <div className="w-full space-y-2">
                        <Label htmlFor="name" className="text-right">Display Name</Label>
                        <Input 
                            id="name" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                            className="col-span-3" 
                        />
                    </div>
                 </div>

                 <DialogFooter>
                   <Button type="submit" onClick={saveProfile} className="bg-purple-600 hover:bg-purple-700">Save changes</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scrollbar-thin scrollbar-thumb-purple-200">
             {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-50">
                     <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-full mb-6 shadow-sm">
                        <Send size={48} className="text-purple-500 ml-1"/>
                     </div>
                     <h3 className="text-slate-600 font-bold text-xl">Start Sharing!</h3>
                     <p className="text-slate-400 text-sm mt-2">Upload PDFs, Images, or Links.</p>
                 </div>
             )}

             {messages.map((msg, index) => {
                 const isMe = msg.senderId === user.id;
                 return (
                     <div key={index} className={`flex gap-4 group animate-in slide-in-from-bottom-2 fade-in duration-300 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                         <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-sm bg-white">
                            <AvatarImage src={msg.avatar} className="object-cover" />
                            <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                         </Avatar>

                         <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                             <span className="text-xs font-bold text-purple-700 ml-1 mb-1 opacity-70">{msg.sender}</span>
                             
                             <div className={`relative px-5 py-3.5 shadow-md text-[15px]
                                 ${isMe 
                                     ? "bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-[20px] rounded-tr-none" 
                                     : "bg-white text-slate-700 border border-slate-200 rounded-[20px] rounded-tl-none"
                                 }`}
                             >
                                 {msg.isFile ? (
                                     <div className="min-w-[200px]">
                                         {msg.fileType === 'image' && (
                                             <div className="mb-3 rounded-lg overflow-hidden border border-white/20 bg-black/10">
                                                <img src={msg.message} alt="shared" className="max-h-60 w-full object-cover"/>
                                             </div>
                                         )}
                                         <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${isMe ? "bg-white/10 border border-white/10" : "bg-purple-50 border border-purple-100"}`}>
                                             <div className="bg-white p-2.5 rounded-lg shadow-sm shrink-0">
                                                {msg.fileType === 'image' && <ImageIcon size={20} className="text-purple-600"/>}
                                                {msg.fileType === 'file' && <FileText size={20} className="text-pink-600"/>}
                                                {msg.fileType === 'link' && <LinkIcon size={20} className="text-blue-500"/>}
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                 <p className="font-bold truncate text-sm">{msg.fileName}</p>
                                                 {msg.fileSize && <p className={`text-[10px] truncate ${isMe ? "text-purple-100" : "text-slate-500"}`}>{msg.fileSize}</p>}
                                             </div>
                                         </div>
                                         <button onClick={() => openUrl(msg.message)} className={`flex items-center justify-center gap-2 py-2 w-full rounded-lg text-xs font-bold transition-all shadow-sm ${isMe ? "bg-white text-purple-700 hover:bg-purple-50" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
                                            {msg.fileType === 'link' ? <ExternalLink size={14}/> : <Download size={14}/>}
                                            {msg.fileType === 'link' ? "Open Link" : "Download File"}
                                         </button>
                                     </div>
                                 ) : (
                                     <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                 )}
                             </div>
                             <span className="text-[10px] text-slate-400 mt-1 font-medium px-1 opacity-80">
                                 {msg.timestamp ? format(new Date(msg.timestamp), "h:mm a") : "Just now"}
                             </span>
                         </div>
                     </div>
                 );
             })}
             <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-5 bg-white border-t border-slate-100 shrink-0 z-20">
             <div className="bg-slate-50 p-2 rounded-[2rem] flex items-center gap-2 border border-slate-200 focus-within:ring-2 focus-within:ring-purple-200 focus-within:border-purple-400 transition-all shadow-sm">
                 <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                 <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-all" title="Upload File">
                    {isUploading ? <Loader2 className="animate-spin h-5 w-5"/> : <Paperclip size={20}/>}
                 </button>

                 <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-all" title="Share Link">
                            <LinkIcon size={20}/>
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Share a Link</DialogTitle></DialogHeader>
                        <div className="flex flex-col gap-4 mt-2">
                            <Input placeholder="Paste URL..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                            <Button onClick={() => sendMessage("link", linkUrl)}>Share Link</Button>
                        </div>
                    </DialogContent>
                 </Dialog>

                 <Input className="border-none bg-transparent shadow-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400 text-base h-10 flex-1 font-medium px-2" placeholder="Type a message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage("text")} disabled={loading || isUploading} autoComplete="off" />
                 
                 <Button onClick={() => sendMessage("text")} disabled={loading || !inputMessage.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-purple-200 transition-transform hover:scale-105">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send size={18} className="ml-0.5"/>}
                 </Button>
             </div>
          </div>
      </div>

      {/* --- SIDEBAR --- */}
      <div className={`fixed md:static inset-y-0 right-0 w-80 bg-white border-l md:border-none md:bg-transparent z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${showSidebar ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}>
          <div className="h-full bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 flex flex-col overflow-hidden">
             <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} className="text-purple-600"/> Resources</h3>
                <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">{sharedResources.length}</span>
                <button onClick={() => setShowSidebar(false)} className="md:hidden text-slate-400 hover:text-red-500"><X size={20}/></button>
             </div>
             <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-white">
                 {sharedResources.length === 0 ? (
                     <div className="text-center mt-20 opacity-50"><div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-3"><ExternalLink size={28} className="text-slate-400"/></div><p className="text-sm text-slate-500 font-medium">No resources yet</p></div>
                 ) : (
                     sharedResources.map((file, i) => (
                         <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all group">
                             <div className="flex items-center gap-3 mb-3">
                                 <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${file.fileType === 'image' ? 'bg-purple-100 text-purple-600' : (file.fileType === 'link' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600')}`}>
                                     {file.fileType === 'image' && <ImageIcon size={16}/>}
                                     {file.fileType === 'file' && <FileText size={16}/>}
                                     {file.fileType === 'link' && <LinkIcon size={16}/>}
                                 </div>
                                 <div className="overflow-hidden min-w-0">
                                     <p className="text-sm font-bold text-slate-700 truncate">{file.fileName}</p>
                                     <p className="text-[10px] text-slate-400">By {file.sender}</p>
                                 </div>
                             </div>
                             <button onClick={() => openUrl(file.message)} className="flex items-center justify-center gap-2 py-2 w-full rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 hover:bg-purple-600 hover:text-white transition-colors">
                                 <ExternalLink size={12}/> OPEN
                             </button>
                         </div>
                     ))
                 )}
             </div>
          </div>
      </div>
      
      {showSidebar && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setShowSidebar(false)}></div>}
    </div>
  );
};

export default Community;