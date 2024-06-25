// Function to get the content from Editor.js
async function getContentFromEditor(editorInstance) {
  try {
    const savedData = await editorInstance.save(); // Get the saved data from Editor.js
    return savedData; // Return the saved data
  } catch (error) {
    console.error('Error getting content from Editor.js:', error);
    throw error; // Handle the error appropriately
  }
}

module.exports = { getContentFromEditor };