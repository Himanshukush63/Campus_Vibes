import React, { useState } from "react";

const EMOJI_CATEGORIES = {
  "Smileys & Emotion": [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯",
    "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐",
    "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈",
    "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾",
    "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿",
    "😾"
  ],
  "Gestures & Body": [
    "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟",
    "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎",
    "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
    "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻",
    "👃", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄", "👶", "🧒",
    "👦", "👧", "🧑", "👨", "👩", "🧔", "👱", "🧓", "👴", "👵",
    "🙍", "🙎", "🙅", "🙆", "💁", "🙋", "🧏", "🙇", "🤦", "🤷",
    "👮", "🕵️", "💂", "👷", "🤴", "👸", "👳", "👲", "🧕", "🤵",
    "👰", "🤰", "🤱", "👼", "🎅", "🤶", "🧙", "🧚", "🧛", "🧜",
    "🧝", "🧞", "🧟", "💆", "💇", "🚶", "🧍", "🧎", "🏃", "💃",
    "🕺", "🕴️", "👯", "🧖", "🧗", "🤺", "🏇", "⛷️", "🏂", "🏌️",
    "🏄", "🚣", "🏊", "⛹️", "🏋️", "🚴", "🚵", "🤸", "🤼", "🤽",
    "🤾", "🤹", "🧘", "🛀", "🛌", "👭", "👫", "👬", "💏", "💑",
    "👪"
  ],
  "Animals & Nature": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
    "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
    "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
    "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
    "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕",
    "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳",
    "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘",
    "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄",
    "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮",
    "🐕‍🦺", "🐈", "🐈‍⬛", "🪶", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩",
    "🕊️", "🐇", "🦝", "🦨", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀",
    "🐿️", "🦔", "🌵", "🎄", "🌲", "🌳", "🌴", "🪵", "🌱", "🌿",
    "☘️", "🍀", "🎍", "🪴", "🎋", "🍃", "🍂", "🍁", "🍄", "🐚",
    "🪨", "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻"
  ]
};

export default function EmojiPicker({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState("Smileys & Emotion");

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg w-64 h-80 flex flex-col">
      {/* Category tabs */}
      <div className="flex border-b dark:border-gray-700 overflow-x-auto">
        {Object.keys(EMOJI_CATEGORIES).map(category => (
          <button
            key={category}
            className={`px-3 py-2 text-sm whitespace-nowrap ${activeCategory === category 
              ? "text-blue-500 border-b-2 border-blue-500" 
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            onClick={() => setActiveCategory(category)}
          >
            {category.split(" ")[0]}
          </button>
        ))}
      </div>
      
      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 grid grid-cols-8 gap-1">
        {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 flex items-center justify-center"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}