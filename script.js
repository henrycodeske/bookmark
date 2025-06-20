const addBookmarkBtn = document.getElementById("add-bookmark");
const bookmarkList = document.getElementById("bookmark-list");
const bookmarkNameInput = document.getElementById("bookmark-name");
const bookmarkUrlInput = document.getElementById("bookmark-url");
const bookmarkTagsInput = document.getElementById("bookmark-tags");
const exportBtn = document.getElementById("export-bookmarks");
const importInput = document.getElementById("import-bookmarks");

document.addEventListener("DOMContentLoaded", loadBookmarks);

addBookmarkBtn.addEventListener("click", function () {
  const name = bookmarkNameInput.value.trim();
  const url = bookmarkUrlInput.value.trim();
  const tags = bookmarkTagsInput.value.trim();

  if (!name || !url) {
    alert("Please enter both name and URL.");
    return;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    alert("Please enter a valid URL starting with http:// or https://");
    return;
  }

  const bookmarks = getBookmarksFromStorage();
  const duplicate = bookmarks.some((b) => b.name === name || b.url === url);

  if (duplicate) {
    alert("Bookmark already exists.");
    return;
  }

  addBookmark(name, url, tags);
  saveBookmark(name, url, tags);
  bookmarkNameInput.value = "";
  bookmarkUrlInput.value = "";
  bookmarkTagsInput.value = "";
});

function addBookmark(name, url, tags) {
  const li = document.createElement("li");

  const link = document.createElement("a");
  link.href = url;
  link.textContent = name;
  link.target = "_blank";

  const tagSpan = document.createElement("span");
  tagSpan.textContent = tags ? `Tags: ${tags}` : "";

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", function () {
    const confirmDelete = confirm("Are you sure you want to delete this bookmark?");
    if (confirmDelete) {
      bookmarkList.removeChild(li);
      removeBookmarkFromStorage(name, url);
    }
  });

  li.appendChild(link);
  li.appendChild(tagSpan);
  li.appendChild(removeButton);
  bookmarkList.appendChild(li);
}

function getBookmarksFromStorage() {
  const bookmarks = localStorage.getItem("bookmarks");
  return bookmarks ? JSON.parse(bookmarks) : [];
}

function saveBookmark(name, url, tags) {
  const bookmarks = getBookmarksFromStorage();
  bookmarks.push({ name, url, tags });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function loadBookmarks() {
  const bookmarks = getBookmarksFromStorage();
  bookmarks.forEach((bookmark) => addBookmark(bookmark.name, bookmark.url, bookmark.tags));
}

function removeBookmarkFromStorage(name, url) {
  let bookmarks = getBookmarksFromStorage();
  bookmarks = bookmarks.filter((bookmark) => bookmark.name !== name || bookmark.url !== url);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

exportBtn.addEventListener("click", function () {
  const bookmarks = getBookmarksFromStorage();
  const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bookmarks.json";
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      const bookmarks = getBookmarksFromStorage();
      imported.forEach(({ name, url, tags }) => {
        if (!bookmarks.some((b) => b.name === name || b.url === url)) {
          bookmarks.push({ name, url, tags });
        }
      });

      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      bookmarkList.innerHTML = "";
      loadBookmarks();
    } catch (err) {
      alert("Failed to import bookmarks: " + err.message);
    }
  };
  reader.readAsText(file);
});
