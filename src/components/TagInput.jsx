import { useState } from "react";
import { X, Plus, Tag } from "lucide-react";

const TagInput = ({
  tags = [],
  onChange,
  availableTags = [],
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tagName) => {
    const trimmed = tagName.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = availableTags.filter(
    (t) =>
      !tags.includes(t.name.toLowerCase()) &&
      t.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex items-center flex-wrap gap-2 p-2 rounded-lg bg-white/5 border border-white/10 focus-within:border-primary-500/50">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary-500/20 text-primary-300 rounded-md"
          >
            <Tag className="w-3 h-3" />
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-white/10 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleAddTag(tag.name)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-white/40">
        {tags.length}/{maxTags} tags • Press Enter to add
      </p>
    </div>
  );
};

export default TagInput;
