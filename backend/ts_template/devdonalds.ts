import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = {};

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  recipeName = recipeName.trim()
                         .replace(/-/g, ' ')
                         .replace(/_/g, ' ')
                         .replace(/\s+/g, ' ')
                         .replace(/[^a-zA-Z\s]/g, '')
                         .toLowerCase()
                         .split(' ')
                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                         .join(' ');
  return recipeName.length > 0 ? recipeName : null;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const data = req.body;
  if (data.type !== "recipe" && data.type !== "ingredient") {
    res.status(400).send("Wrong type");
    return;
  }

  if (data.type === "ingredient" && data.cookTime < 0) {
    res.status(400).send("Negative cook time");
    return;
  }

  if (data.name in cookbook) {
    res.status(400).send("Name not unique");
    return;
  }

  if (data.type === "recipe") {
    const seen = new Set<string>();
    const requiredItems: requiredItem[] = [];
    for (const item of data.requiredItems) {
      if (seen.has(item.name)) {
        res.status(400).send("Required item not unique");
        return;
      }
      seen.add(item.name);
      requiredItems.push({ name: item.name, quantity: item.quantity });
    }
    cookbook[data.name] = { ...data, requiredItems };
  } else {
    cookbook[data.name] = { ...data, cookTime: data.cookTime };
  }

  res.status(200).json({});
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const data = req.query.name;

  if (!data || !(data in cookbook)) {
    res.status(400).send("Recipe not found");
    return;
  }

  const root = cookbook[data];
  if (!("requiredItems" in root)) {
    res.status(400).send("Not a recipe");
    return;
  }

  const final: any = {
    name: root.name,
    cookTime: 0,
    ingredients: [],
    seen: new Set(),
  };

  if (!helper(root.requiredItems, 1, final)) {
    res.status(400).send("Ingredient not found");
    return;
  }

  res.status(200).json({
    name: final.name,
    cookTime: final.cookTime,
    ingredients: final.ingredients,
  });
});

const helper = (requiredItems: requiredItem[], multiplier: number, final: any): boolean => {
  for (const child of requiredItems) {
    if (!(child.name in cookbook)) {
      return false;
    }
    if ("cookTime" in cookbook[child.name]) {
      if (final.seen.has(child.name)) {
        const item = final.ingredients.find((i) => i.name === child.name);
        if (item) item.quantity += child.quantity * multiplier;
      } else {
        final.ingredients.push({ name: child.name, quantity: child.quantity * multiplier });
        final.seen.add(child.name);
      }
      final.cookTime += (cookbook[child.name] as ingredient).cookTime * child.quantity * multiplier;
    } else {
      if (!helper((cookbook[child.name] as recipe).requiredItems, child.quantity * multiplier, final)) {
        return false;
      }
    }
  }
  return true;
};

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
