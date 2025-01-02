<template>
  <div class="bg-gray-300">
    <div class="actions" style=" text-align: center;">
      <button @click="addNodePrompt" class="btn">Add Node</button>
      <button @click="editNodePrompt" class="btn">Edit Node</button>
      <button @click="deleteNodePrompt" class="btn">Delete Node</button>
      <button @click="saveMindMap" class="btn">Save Mind Map</button>
    </div>
    <div id="jsmind_container" style="width: 100%; height: 750px ; border: 1px solid #ccc;"></div>

  </div>
</template>

<script>
import "jsmind/style/jsmind.css";
import jsMind from "jsmind";
import Swal from "sweetalert2";

export default {
  name: "TreeDiagram",
  props: {
    data: {
      type: Object,
      required: true,
    },
    chapterId: {
      type: [String, Number], // Support both types
      required: true,
    },
  },
  data() {
    return {
      jm: null, // To hold the jsMind instance
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(newData) {
        if (newData) {
          this.initializeMindMap(newData);
        }
      },
    },
  },
  methods: {
    cleanTopic(topic) {
      return topic.replace(/<i.*<\/i>/, "").trim(); // Remove the icon HTML and trim whitespace
    },
    // Initialize the mind map
    initializeMindMap(treeData) {
      const mindData = {
        meta: { name: "MindMap", author: "Author", version: "1.0" },
        format: "node_array",
        data: this.convertToJsMindData(treeData),
      };

      const options = {
        container: "jsmind_container",
        editable: true, // Enable edit for CRUD
        draggable: true, // Enable draggable nodes
        theme: "default",
        support_html: true,
        view: {
          dblclick_handle: this.handleNodeClick, // Enable double-click for popup
        },
      };

      this.jm = new jsMind(options);
      this.jm.show(mindData);

      // Add node drop listener
      this.jm.add_event_listener(jsMind.event_type.node_drop, this.handleNodeDrop);

      // Add click event listener for single-click popups
      const container = document.getElementById("jsmind_container");
      container.addEventListener("click", () => {
        const selectedNode = this.jm.get_selected_node();
        if (selectedNode) {
          this.handleNodeClick(selectedNode);
        }
      });
    },

    // Handle node click to display details
    handleNodeClick(selectedNode) {

      if (selectedNode && selectedNode.data.data.details) {
        Swal.fire({
          title: selectedNode.topic,
          text: selectedNode.data.data.details, // Display the details in the popup
          confirmButtonText: "Close",
        });
      }
    },

    // Handle node drag-and-drop
    handleNodeDrop(data) {
      console.log("Node Dropped:", data);

      // Show details of the drag-and-drop action
      Swal.fire({
        title: "Node Dropped",
        html: `
          <p>Dragged Node ID: <b>${data.drag_node_id}</b></p>
          <p>Dropped On Node ID: <b>${data.drop_node_id}</b></p>
          <p>Drop Type: <b>${data.drop_type}</b></p>
        `,
        icon: "info",
        confirmButtonText: "OK",
      });

      // Optionally, save the updated structure
      this.saveMindMap();
    },

    // Save the mind map back to original JSON format
    async saveMindMap() {
      const mindNodes = this.jm.get_data("node_array").data;
      const restoredTreeData = this.convertFromJsMindData(mindNodes);

      console.log("Restored JSON:", JSON.stringify(restoredTreeData, null, 2));
      try {
        await this.saveToDatabase(restoredTreeData);
        Swal.fire("Success", "Mind map saved to the database successfully!", "success");
        location.reload();
      } catch (error) {
        Swal.fire("Error", "Failed to save the mind map to the database.", "error");
        console.error("Error saving mind map to the database:", error);
      }
      return restoredTreeData;
    },

    // Add a new child node
    async addNodePrompt() {
      const selectedNode = this.jm.get_selected_node();

      if (!selectedNode) {
        Swal.fire("Error", "Please select a node to add a child.", "error");
        return;
      }

      const { value: nodeName } = await Swal.fire({
        title: "Add Node",
        input: "text",
        inputLabel: "Node Name",
        inputPlaceholder: "Enter node name",
        showCancelButton: true,
      });

      if (nodeName) {
        const { value: nodeDetails } = await Swal.fire({
          title: "Add Node Details",
          input: "text",
          inputLabel: "Node Details",
          inputPlaceholder: "Enter node details",
          showCancelButton: true,
        });

        this.addNode(selectedNode.id, nodeName, nodeDetails);
        Swal.fire("Success", "Node added successfully.", "success");
        this.saveMindMap();
      }
    },

    // Edit an existing node
    async editNodePrompt() {
      const selectedNode = this.jm.get_selected_node();
      console.log("Selected Node:", selectedNode);

      if (!selectedNode) {
        Swal.fire("Error", "Please select a node to edit.", "error");
        return;
      }

      const cleanName = this.cleanTopic(selectedNode.topic); // Remove icon from topic

      // Prompt for new node name
      const { value: nodeName } = await Swal.fire({
        title: "Edit Node",
        input: "text",
        inputLabel: "New Node Name",
        inputValue: cleanName, // Use cleaned topic for the input value
        showCancelButton: true,
      });
      console.log("New Node Name:", selectedNode.data);
      if (nodeName) {
        // Prompt for new details
        const { value: nodeDetails } = await Swal.fire({
          title: "Edit Node Details",
          input: "textarea", // Use a textarea for details
          inputLabel: "New Node Details",
          inputValue: selectedNode.data.data.details || selectedNode.data.details || "", // Load current details or empty if undefined
          inputAttributes: {
            style: "resize: both; height: 100px;", // Make the textarea resizable
          },
          showCancelButton: true,
        });

        // Call editNode to update the node
        this.editNode(selectedNode.id, nodeName, nodeDetails);
        Swal.fire("Success", "Node updated successfully.", "success");
      }
    },


    // Delete a node
    async deleteNodePrompt() {
      const selectedNode = this.jm.get_selected_node();

      if (!selectedNode) {
        Swal.fire("Error", "Please select a node to delete.", "error");
        return;
      }

      const confirmDelete = await Swal.fire({
        title: "Delete Node",
        text: "Are you sure you want to delete this node? This action cannot be undone. The children will also be deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
      });

      if (confirmDelete.isConfirmed) {
        this.deleteNode(selectedNode.id);
        this.saveMindMap();
      }
    },

    // Add a new child node
    addNode(parentId, topic, details = null) {
      const newId = `node_${new Date().getTime()}`;
      console.log("Adding node:", { parentId, newId, topic, details });

      // Construct the data object and include details only if provided
      const nodeData = {};
      if (details) {
        nodeData.details = details; // Add details only if provided
      }

      // Use jsMind's `add_node` method
      this.jm.add_node(parentId, newId, topic, nodeData);

      console.log("Node added successfully:", {
        parentId,
        newId,
        topic,
        data: nodeData,
      });
    },



    // Edit a node's topic or details
    editNode(nodeId, newTopic, newDetails) {
      const node = this.jm.get_node(nodeId);
      console.log("Editing node:", node);
      if (node) {
        const cleanName = this.cleanTopic(newTopic); // Ensure the topic is clean before updating
        node.topic = cleanName; // Update the topic
        node.data = node.data || {}; // Ensure data object exists

        // Preserve existing details if newDetails is null or undefined
        if (newDetails === undefined) {
          newDetails =null; // Retain existing details
        }
        console.log("WOI" + newDetails);
        console.log(newDetails != undefined)
        // Update details only if they exist
        if (newDetails != undefined) {
          node.data.data.details = newDetails;
        } else {
          delete node.data.data.details; // Remove the details field if it's null or empty
        }

        console.log("Updated node:", { nodeId, cleanName, newDetails });
        this.jm.update_node(nodeId, cleanName); // Update the displayed topic
        this.saveMindMap();
      }
    },


    // Delete a node
    deleteNode(nodeId) {
      this.jm.remove_node(nodeId);
    },
    // Save tree data to the database
    async saveToDatabase(treeData) {
      console.log("Saving tree data to the database:", treeData);
      console.log("Chapter ID:", this.chapterId); // Use chapterId prop here
      console.log("Chapter ID:", this.$route.params.chapterId); // Use chapterId prop here
      try {
        const response = await fetch(`http://localhost:3000/chapters/${this.chapterId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ treeData }),
        });

        if (!response.ok) {
          throw new Error("Failed to save tree data to the database");
        }

        console.log("Tree data successfully saved to the database.");
      } catch (error) {
        console.error("Error during save to database:", error);
        throw error; // Re-throw the error to handle it in saveMindMap
      }
    },

    // Convert JSON structure to jsMind format
    convertToJsMindData(treeData, parentid = null, idCounter = { value: 1 }) {
      const nodes = [];
      const traverse = (node, parentid) => {
        const currentId = `node_${idCounter.value++}`;
        console.log("Converting node:", { currentId, parentid, node });
        const hasDetails = !!node.details;

        // Add the icon if the node has details
        const topicWithIcon = hasDetails
          ? `${node.name} <i class="fa-regular fa-message" style="color: #007bff;"></i>`
          : node.name;

        nodes.push({
          id: currentId,
          parentid: parentid,
          topic: topicWithIcon, // Display icon for nodes with details
          isroot: parentid === null,
          data: {
            details: node.details || null, // Attach details
          },
        });

        if (node.children && Array.isArray(node.children)) {
          node.children.forEach((child) => traverse(child, currentId));
        }
      };
      traverse(treeData, parentid);
      return nodes;
    },




    // Convert jsMind data back to original JSON format
    convertFromJsMindData(nodes) {
      const idNodeMap = {};
      const root = {};

      // Helper to clean the topic by removing HTML (e.g., icons)
      const cleanTopic = (topic) => topic.replace(/<i.*<\/i>/, "").trim();

      // Map all nodes by ID
      nodes.forEach((node) => {
        const nodeData = {
          name: cleanTopic(node.topic), // Clean topic to remove icons
          children: [],
        };
        // Add `details` only if it exists
        if (node.data && node.data.details) {
          nodeData.details = node.data.details;
        } else if (node.details) {
          nodeData.details = node.details;
        }

        idNodeMap[node.id] = nodeData;

        // Assign root node if it's the root
        if (node.isroot) {
          Object.assign(root, nodeData);
        }
      });

      // Attach children to their parent nodes
      nodes.forEach((node) => {
        if (node.parentid) {
          idNodeMap[node.parentid].children.push(idNodeMap[node.id]);
        }
      });

      return root;
    },


  },
};
</script>

<style>
#jsmind_container {
  width: 100%;
  height: 90%;
  border: 1px solid #ccc;
}

.btn {
  margin: 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.node-with-details {
  background-color: #ff69b4 !important;
  /* Pink background */
  color: white !important;
  /* Optional: Change text color for contrast */
  border-radius: 5px;
  /* Optional: Add rounded corners */
}

/* For Webkit-based browsers (Chrome, Safari and Opera) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* For IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
