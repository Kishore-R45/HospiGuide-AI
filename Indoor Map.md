# 1. Extract Floor Plan Layout  

 *Figure: Example of a hospital floorplan (blocks A, B, etc.).* We begin by treating the uploaded image as an indoor floorplan. First, **identify key areas** (rooms, corridors, lobbies) by their labels and shapes. In our college-as-hospital prototype, each “block” (A, B, C, …) represents a section of the building (e.g. **Registration**, **OPD**, **Lab**, **Pharmacy**, etc.). We mark **nodes** at each room center or corridor junction, and **edges** along walkable paths. Research shows that floorplans can be parsed into a **graph model**: rooms and spaces become graph nodes, and doors/corridors become edges. For example, each department room is a node, connected by edges where corridors or doorways meet (Fig. above).  

Next, apply image processing (or manual tracing) to outline walls and open areas. Automatic or semi-automatic methods (e.g. line detection, convex polygon approximation) can identify walls and doors. In practice, one can draw or annotate on the image: place small invisible markers (e.g. SVG `<circle>` points) at each significant location (intersections, entrances, department centers). In an SVG/graph approach, each marker has `(x,y)` coordinates and a list of neighbors. The resulting **graph skeleton** resembles the purple/black diagram below, with nodes (orange) at rooms and edges (purple) along corridors. This forms the backbone for navigation.  

 *Figure: Graph nodes (orange) and paths (purple) extracted from a floorplan (each orange dot is a room/space node, purple lines are hallways).* The goal is to **convert the image into a vector graph**. Each room’s center or doorway becomes a node; an edge is added between two nodes if they share a common doorway or corridor. As shown in Fig., Orange dots are node positions and purple lines are connectivity (corridors). We also record room metadata (name, type) at each node. In summary: identify all labeled areas (from image and doc), place nodes, and connect them where passage exists.  

# 2. Parse Blocks and Landmarks from Document  

The attached DOCX provides **room labels, block names, and landmarks** (e.g. “Block A – Registration”, “Block B – OPD”, “Block C – Lab”, plus nearby features like lifts or cafeterias). Extract each entry into a structured list. For instance, list all **departments/rooms** by block: 
- *Block A:* “Registration” (Library), “Pharmacy” (Library), etc. 
- *Block B:* “OPD” (Seminar Hall), “Blood Lab” (Laboratory), etc. 
Include any landmark or special note (e.g. “Stairs next to Canteen”).  

Compile tables of **nodes**: each node entry contains a unique ID, human-readable name, category/type (e.g. “Pharmacy”, “Lab”, “Room”), and any landmarks. Also note “floor” or “block” if multi-floor. For example:  

- Node `A1`: Registration Counter (Block A, Floor 0, landmark “Entrance Lobby”)  
- Node `A2`: Pharmacy (Block A, Floor 0, landmark “Beside Stairs”)  
- Node `B1`: OPD (Block B, Floor 1, landmark “Next to Lift”)  

No citation is needed here since this step uses **user-provided data**. The key is to ensure consistency: every room/department in the doc must correspond to one node.  

# 3. Build the Graph (Nodes & Edges)  

With nodes defined, construct the **connectivity graph**. Create an edge between nodes whenever there is a direct path (corridor or door) between them. For example, if Registration (Node A1) opens into the main corridor leading to Pharmacy (A2), add an edge A1–A2. In graph terms, this follows common approaches: represent rooms as nodes and doorways as edges.  

Each node record will include its `(x,y)` coordinates (on a convenient local grid), plus metadata such as “room type”, “floor”, or “department”. Edges include a distance or weight (we can compute Euclidean distance from the coordinates). We use algorithms like **A*** or Dijkstra on this graph for routing.  

In practice, one can embed these nodes in an SVG map (invisible circles) with attributes. For instance, an SVG node element might look like:  
```xml
<circle id="node_A1" cx="10" cy="5" r="0.1" data-neighbors="node_A2,node_J1"/>
```  
Here `cx,cy` are coordinates, and `data-neighbors` lists adjacent nodes. This is exactly the technique described in one project: invisible SVG points with neighbor lists allow a backend to parse and run shortest-path routing.  

# 4. Determine Coordinates and Scale  

Next, assign real coordinates to each node. We anchor the map to the college’s GPS: the given campus entrance (lat=13.0322505, lon=80.1794325) serves as the origin. Around this point, we lay out a local XY grid. For simplicity, use **relative distances** in meters (e.g. 1 grid unit = 1 meter). For example, if the corridor from Entrance to Registration is 10m, set Registration at (10,0) if Entrance is (0,0). Extract distances from known campus dimensions or measure on-site.  

Because we lack exact floorplan scale, use an approximate method: count floor tiles or use a laser measure to estimate key distances (corridor lengths, room widths). Alternatively, use the Google Maps link of the campus to estimate building footprint. Once a consistent unit is chosen, compute each node’s `(x,y)`. Also, store the real-world geo-location of one reference point (the QR code entrance) as metadata.  

With coordinates set, the edges’ distances can be auto-calculated (or manually entered). For example, if Pharmacy at (25,5) and Lab at (25,20), the distance is 15 units. These become edge weights for navigation.  

# 5. Generate JSON Data Structure  

Finally, compile everything into a structured JSON. This JSON will be the AI-app’s “map dataset” and look like:  

```json
{
  "anchor": { "lat": 13.0322505, "lon": 80.1794325 },
  "nodes": [
    {"id":"A1","name":"Registration","type":"Room","floor":0,"block":"A","x":0,"y":0,"neighbors":["A2","J1"]},
    {"id":"A2","name":"Pharmacy","type":"Facility","floor":0,"block":"A","x":10,"y":0,"neighbors":["A1","B1"]},
    {"id":"B1","name":"OPD","type":"Clinic","floor":1,"block":"B","x":10,"y":15,"neighbors":["A2","C1"]},
    ...
  ],
  "edges": [
    {"from":"A1","to":"A2","distance":10},
    {"from":"A2","to":"B1","distance":15},
    ...
  ],
  "ble_beacons": [
    {"id":"BLE1","x":0,"y":0,"floor":0,"desc":"Main Entrance"},
    {"id":"BLE2","x":10,"y":7,"floor":0,"desc":"Near Lift"},
    {"id":"BLE3","x":25,"y":20,"floor":0,"desc":"Outside Canteen"}
  ],
  "metadata": {"building":"College Hospital Prototype","scale":"1 unit=1m"}
}
```

- **`anchor`** holds the campus lat/lon reference.  
- **`nodes`** is a list of all map nodes (rooms, landmarks), each with coordinates, type, and neighbor IDs.  
- **`edges`** (optional) explicitly list connections and distances (these can be derived from nodes, but it’s often convenient to precompute).  
- **`ble_beacons`** lists BLE tag locations: place only a few at strategic nodes (e.g. entrance, lifts) to correct drift. BLE beacons are known to be cheap, low-power, and commonly used for indoor localization.  
- **`metadata`** can include any extra info (e.g. building name, scaling factor).  

In the JSON above, `neighbors` is a quick way to encode adjacency. This matches the method inwhere each SVG point listed neighbor IDs. The AI backend can parse this JSON into a graph object.

# 6. Generate an SVG Map for the App  

Using the same coordinate grid, draw the indoor map as an SVG. Each **node** (room) can be represented by a small circle or icon, and **edges** by line segments. The overlay can show the user’s current position (from sensors) and the path. For example, one can programmatically generate:  

```xml
<svg viewBox="0 0 100 100">
  <!-- Nodes -->
  <circle cx="0" cy="0" r="0.3" fill="orange"/><text x="1" y="0">Entrance</text>
  <circle cx="10" cy="0" r="0.3" fill="orange"/><text x="11" y="0">Pharmacy</text>
  <!-- Edges -->
  <line x1="0" y1="0" x2="10" y2="0" stroke="gray" stroke-width="0.1"/>
  ...
</svg>
```

The JSON data can be used to draw this SVG. Nodes at (`x`,`y`) become `<circle>` or `<rect>` elements, and edges become `<line>`s or `<path>`. This provides a **visual map** that can update in real time. The path between start and destination (computed by A*/Dijkstra on the JSON graph) can be drawn as a highlighted polyline on the SVG.  

---

**Summary:** We convert the provided image+document into a **graph model** by identifying rooms as nodes and corridors as edges. We assign coordinates relative to a known campus location. The resulting JSON (above) encodes nodes, edges, and BLE locations for sensor correction. This structured dataset feeds into our React navigation app. An SVG map can be rendered from the same data for real-time guidance. By following these steps – parsing the floorplan image, extracting labels from the document, and building a node-edge graph – the AI system will have all the data it needs to **perform accurate indoor navigation** in the hospital prototype. 

**Sources:** Techniques and concepts drawn from indoor mapping and navigation research.