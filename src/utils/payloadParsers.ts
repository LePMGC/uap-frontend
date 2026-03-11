// src/utils/payloadParsers.ts

export const parseUcipXml = (xmlString: string): any[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // UCIP typically wraps the main content in a root struct
    const rootStruct = xmlDoc.querySelector("params > param > value > struct");
    if (!rootStruct) return [];

    return parseMembers(rootStruct);
  } catch (e) {
    console.error("Failed to parse UCIP XML", e);
    return [];
  }
};

const parseMembers = (structNode: Element): any[] => {
  const params: any[] = [];
  const members = structNode.querySelectorAll(":scope > member");

  members.forEach((member, index) => {
    const nameEl = member.querySelector(":scope > name");
    const valueContainer = member.querySelector(":scope > value");

    if (nameEl && valueContainer) {
      const name = nameEl.textContent || "";
      const typeNode = valueContainer.firstElementChild;
      const type = typeNode ? typeNode.tagName.toLowerCase() : "string";

      let children: any[] = [];
      let defaultValue = "";

      if (type === "array") {
        // Find the <data> container which holds the array items
        const dataContainer = valueContainer.querySelector("array > data");
        if (dataContainer) {
          // Iterate through each <value> inside <data>
          const arrayValues = dataContainer.querySelectorAll(":scope > value");
          arrayValues.forEach((valNode, idx) => {
            const innerNode = valNode.firstElementChild;
            const innerType = innerNode
              ? innerNode.tagName.toLowerCase()
              : "string";

            children.push({
              id: `item-${name}-${idx}`,
              name: `${idx}`, // Displayed as "0", "1", etc.
              label: `Item ${idx}`,
              type: innerType,
              is_array_item: true, // Flag for UI styling
              children:
                innerType === "struct"
                  ? parseMembers(innerNode as Element)
                  : [],
            });
          });
        }
      } else if (type === "struct") {
        children = parseMembers(typeNode as Element);
      } else {
        defaultValue = typeNode?.textContent || "";
      }

      params.push({
        id: `param-${name}-${index}`,
        name: name,
        label: name.replace(/([A-Z])/g, " $1").trim(),
        type: type,
        default_value: defaultValue,
        is_mandatory: false,
        children: children,
      });
    }
  });

  return params;
};
