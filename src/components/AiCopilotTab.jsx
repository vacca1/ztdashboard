import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2, BarChart2 } from 'lucide-react';

const AiCopilotTab = ({ stockData, topProductsData, shipmentsData }) => {
 const [messages, setMessages] = useState([
 {
 id: 1,
 sender: 'ai',
 text: 'Olá Franciel! Sou seu Assistente de Vendas IA. Já analisei o estoque, os produtos mais vendidos da região e o histórico de embarques. O que você quer saber antes de fazermos a oferta?',
 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 }
 ]);
 const [input, setInput] = useState('');
 const [isTyping, setIsTyping] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, isTyping]);

 const generateAIResponse = (userQuery) => {
 const query = userQuery.toLowerCase();
 let response ="";

 // VERY basic mockup of an AI response logic based on the data context
 if (query.includes('resumo') || query.includes('perfil')) {
 const boughtMics = shipmentsData?.detailed?.some(s => s.name.toLowerCase().includes('microfone'));
 response = `Com base no histórico (Relatório 5), este lojista tem foco em áudio profissional. ${boughtMics ? 'Ele já comprou microfones nossos antes.' : 'Ele AINDA NÃO comprou nossos microfones, que é o nosso ponto forte.'} O ticket médio dele tem potencial para subir 40% se oferecermos o Kit Dominação.`;
 } 
 else if (query.includes('ruptura') || query.includes('faltando') || query.includes('acabar')) {
 response ="Analisando a curva, há uma alta demanda por microfones nos embarques recentes. Dada a média de giro da região (Top Produtos), é a oportunidade perfeita para puxar um pedido de reposição.";
 }
 else if (query.includes('argumento') || query.includes('o que falar') || query.includes('como vender')) {
 response = `Sugiro o seguinte argumento:"Amigo, vi que você parou de faturar com a linha UDX este mês. O mercado vizinho tá vendendo bem. Tenho aqui 50 peças a pronta entrega. Se levar o kit, te faço uma condição especial e você volta a margear 100% amanhã mesmo".`;
 }
 else if (query.includes('estoque') || query.includes('temos')) {
 // Mocking stock query
 const totalItems = stockData?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
 response = `Atualmente temos ${stockData?.length || 0} SKUs diferentes em estoque, somando quase ${totalItems.toFixed(0)} peças prontas para envio imediato. Muito poder de fogo.`;
 }
 else {
 response ="Interessante ponto. Cruzando com os dados da Mercos, eu vejo que a margem deste cliente pode melhorar. Sugira focar primeiramente nos itens em que temos mais de 10 peças no estoque para garantir entrega rápida.";
 }

 return response;
 };

 const handleSend = (e) => {
 e.preventDefault();
 if (!input.trim()) return;

 const newMsg = {
 id: Date.now(),
 sender: 'user',
 text: input,
 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 };

 setMessages(prev => [...prev, newMsg]);
 setInput('');
 setIsTyping(true);

 // Simulate AI thinking time
 setTimeout(() => {
 const aiResponse = {
 id: Date.now() + 1,
 sender: 'ai',
 text: generateAIResponse(newMsg.text),
 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 };
 setMessages(prev => [...prev, aiResponse]);
 setIsTyping(false);
 }, 1500);
 };

 return (
 <div className="animate-in fade-in zoom-in-95 duration-500 h-[calc(100vh-12rem)] min-h-[500px] flex flex-col rounded-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm border-brand-500/20 rounded-sm overflow-hidden relative">
 
 {/* Background Decals */}
 
  {/* Header */}
  <div className="p-6 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md flex items-center justify-between z-10">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-stroke dark:border-strokedark">
  <Bot className="w-6 h-6 text-slate-500 dark:text-slate-400" />
  </div>
  <div>
  <h3 className="text-xl font-space font-bold text-gray-900 dark:text-white mt-1 tracking-tight flex items-center gap-2">
  Assistente IA 
  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-stroke dark:border-strokedark uppercase tracking-wider">ZT-COPILOT</span>
  </h3>
  <p className="text-sm text-gray-500 dark:text-gray-400">Contexto carregado: BI do Lojista + Estoque ZT</p>
  </div>
  </div>
  
  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-sm text-sm font-medium transition-colors border border-stroke dark:border-strokedark">
  <BarChart2 className="w-4 h-4" />
  Re-analisar Dados
  </button>
  </div>

  {/* Chat Area */}
  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 z-10">
  {messages.map((msg) => (
  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
  <div className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
  
  {/* Avatar */}
  <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${
  msg.sender === 'user' ? 'bg-slate-100 dark:bg-slate-800 border-stroke dark:border-strokedark' : 'bg-brand-500 border-brand-600'
  }`}>
  {msg.sender === 'user' ? <User className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <Bot className="w-5 h-5 text-white" />}
  </div>

  {/* Bubble */}
  <div className={`p-4 rounded-sm relative ${
  msg.sender === 'user' 
  ? 'bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-white border border-stroke dark:border-strokedark' 
  : 'bg-white dark:bg-white/[0.03] border border-stroke dark:border-strokedark text-gray-800 dark:text-white/90'
  }`}>
  <p className="text-sm leading-relaxed">{msg.text}</p>
  <span className={`text-[10px] mt-2 block ${msg.sender === 'user' ? 'text-gray-500 dark:text-gray-400 text-right' : 'text-gray-500 dark:text-gray-400 text-left'}`}>
  {msg.timestamp}
  </span>
  </div>


 </div>
 </div>
 ))}

 {isTyping && (
 <div className="flex justify-start">
 <div className="flex gap-4 max-w-[80%]">
 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br from-purple-500 to-brand-600 border border-purple-400/30">
 <Bot className="w-5 h-5 text-white animate-pulse" />
 </div>
 <div className="p-4 rounded-sm border border-purple-500/20 text-gray-800 dark:text-white/90 rounded-tl-sm flex items-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
 <span className="text-sm text-purple-400/80">Analisando base de dados...</span>
 </div>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <div className="p-4 border-t border-gray-200 dark:border-gray-800 z-10">
 <div className="flex flex-col gap-2 relative">
 
 {/* Suggested Prompts */}
 <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-none px-2 absolute -top-12 left-0 right-0">
 <button onClick={() => setInput('Resuma o perfil deste cliente')} className="shrink-0 text-xs bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
 Resumo do perfil
 </button>
 <button onClick={() => setInput('Tem algum item em risco de ruptura?')} className="shrink-0 text-xs bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
 Alerta de Ruptura
 </button>
 <button onClick={() => setInput('Me dê um argumento forte pra vender o Kit Ouro')} className="shrink-0 text-xs bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
 Argumento de venda
 </button>
 </div>

 <form onSubmit={handleSend} className="relative flex items-center">
 <input 
 type="text" 
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Pergunte ao Copilot sobre o cliente, estoque ou estratégias de venda..."
 className="w-full bg-gray-50 dark:bg-gray-800 text-white rounded-sm pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-200 dark:border-gray-800 transition-shadow placeholder:text-gray-500 dark:text-gray-400"
 />
 <button 
 type="submit"
 disabled={!input.trim() || isTyping}
 className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-gray-500 dark:text-gray-400 text-white rounded-lg flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-800"
 >
 <Send className="w-4 h-4" />
 </button>
 </form>
 </div>
 </div>

 </div>
 );
};

export default AiCopilotTab;
