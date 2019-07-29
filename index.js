import React from "react";
import ReactDOM from "react-dom";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText
} from "@reach/combobox";
import matchSorter from "match-sorter";
import "./style.css";

const SET_QUERY = "SET_QUERY"
const ADD_TAG = "ADD_TAG";
const DELETE_TAG = "DELETE_TAG";

function Tagger({
  initialSelectedTags = [{ id: 1, name: "Dogs" }],
  initialStoredTags = []
}) {

  const [{ query, selectedTags, storedTags }, dispatch] = React.useReducer(
    function (state, action) {
      switch (action.type) {
        case SET_QUERY: return { ...state, query: action.payload }
        case ADD_TAG: {
          const tag = {...action.payload, uses: 0};
          const newSelectedTags = [...state.selectedTags, tag];
          // If the new Tag is not in the stored tag, add it
          const isNewTag = !state.storedTags.find(
            storedTag => storedTag.name.toLowerCase() === tag.name.toLowerCase()
          );
          return {
            ...state,
            query: "",
            selectedTags: newSelectedTags,
            storedTags: isNewTag ? [...state.storedTags, tag] : state.storedTags
          };
        }
        case DELETE_TAG:
          return {
            ...state,
            selectedTags: state.selectedTags.filter(
              ({ id }) => id !== action.payload
            )
          };
        default:
          return state;
      }
    },
    { query: "", selectedTags: initialSelectedTags, storedTags: initialStoredTags }
  );

  const inputRef = React.useRef(null)
  const selectedTagRefs = React.useRef(selectedTags.map(() => null))
  React.useEffect(function () {
    selectedTagRefs.current = selectedTagRefs.current.slice(0, selectedTags.length);
  }, [selectedTags.length])
  function focusLastSelectedTag() {
    const previousTagEl = selectedTagRefs.current[selectedTagRefs.current.length - 1]
    if (previousTagEl) {
      previousTagEl.focus()
      return previousTagEl
    }
    return false
  }
  
  const optionStyle = { padding: 5, cursor: "pointer" };
  return (
    <div>
      Add or change tags to categorise your event
      <div
        style={{
          border: "1px solid grey",
          backgroundColor: "#eee",
          minHeight: 30,
          display: "flex",
          alignItems: "center",
          padding: 10
        }}
      >
        {selectedTags.map((tag, index) => {
          return (
            <div
              key={tag.id}
              ref={ref => selectedTagRefs.current[index] = ref}
              tabIndex="0"
              className="selectedTag"
              style={{
                border: "1px solid lightgrey",
                backgroundColor: "white",
                borderRadius: 2,
                marginRight: 15,
                padding: 5,
                display: "flex",
                alignItems: "center",
                transition: "100ms border"
              }}
              onKeyDown={e => {
                if (e.key === "Backspace") {
                  dispatch({ type: DELETE_TAG, payload: tag.id });
                  inputRef.current.focus()
                }
              }}
            >
              <div>{tag.name}</div>{" "}
              <button
                style={{ marginLeft: 5 }}
                onClick={() => {
                  dispatch({ type: DELETE_TAG, payload: tag.id });
                }}
              >
                x
              </button>
            </div>
          );
        })}
        <Combobox
          onSelect={itemName => {
            const storedTag = storedTags.find(
              ({ name }) => name.toLowerCase() === itemName.toLowerCase()
            );
            if (storedTag) {
              dispatch({ type: ADD_TAG, payload: storedTag });
            } else {
              dispatch({
                type: ADD_TAG,
                payload: {
                  id: Math.random(), // TODO: Make this a uuid
                  name: itemName
                }
              });
            }
          }}
        >
          <ComboboxInput
          ref={inputRef}
            style={{
              fontSize: 14,
              border: "none",
              background: "none",
            }}
            placeholder="Add a tag..."
            value={query}
            onKeyDown={e => {
              if (e.key === "Backspace" && query.length < 1) {
                focusLastSelectedTag()
              }
            }}
            onChange={e => {
              dispatch({ type: SET_QUERY, payload: e.target.value });
            }}
          />
          <ComboboxPopover style={{ position: "relative", marginTop: 10 }}>
            {/* Triangle pointer */}
            <div style={{
              position: "absolute", top: -5, left: "50%", height: 10, width: 10, backgroundColor: "white", borderLeft: "1px solid lightgrey", borderTop: "1px solid lightgrey", transform: "translateX(-50%) rotate(45deg)",
            }} />
            <ComboboxList style={{
              listStyle: "none", padding: 0, margin: 0, backgroundColor: "white",
              borderRadius: 3,
              boxShadow: "0px 1px .5px #ccc",
              overflow: "hidden"
            }}>
              {matchSorter(storedTags, query, { keys: ["name"] })
                .filter(storedTag => {
                  // Remove already selected tags
                  return !selectedTags.find(
                    selectedTag => selectedTag.name === storedTag.name
                  );
                })
                .map(tag => {
                  return (
                    <ComboboxOption style={optionStyle} value={tag.name}>
                    <ComboboxOptionText/> ({tag.uses})
                    </ComboboxOption>
                  );
                })}
              {!storedTags.find(
                tag => tag.name.toLowerCase() === query.toLowerCase()
              ) && (
                  <ComboboxOption style={optionStyle} value={query}>
                    + Add "<ComboboxOptionText />"
                </ComboboxOption>
                )}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </div>
    </div>
  );
}

const savedTags = [
  {
    id: 0,
    name: "Cats",
    uses: 1
  },
  {
    id: 1,
    name: "Dogs",
    uses: 101
  }
];

const rootElement = document.getElementById("root");
ReactDOM.render(<Tagger initialStoredTags={savedTags} />, rootElement);