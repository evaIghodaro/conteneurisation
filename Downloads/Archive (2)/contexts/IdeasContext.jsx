import { ID, Permission, Role, Query } from "react-native-appwrite";
import { createContext, useContext, useState, useCallback } from "react";
import { tablesDB, DATABASE_ID, TABLE_ID } from "../lib/appwrite";
import { toast } from "../lib/toast";

const IdeasContext = createContext();

export function useIdeas() {
  return useContext(IdeasContext);
}

export function IdeasProvider({ children }) {
  const [ideas, setIdeas] = useState([]);

  const fetch = useCallback(async () => {
    try {
      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [Query.orderDesc("$createdAt"), Query.limit(10)],
      });
      setIdeas(response.rows);
    } catch (_) {
      setIdeas([]);
    }
  }, []);

  async function add(idea) {
    const response = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data: idea,
      permissions: [Permission.write(Role.user(idea.userId))],
    });
    setIdeas((prev) => [response, ...prev].slice(0, 10));
    toast("Idea added");
  }

  async function remove(id) {
    await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
    setIdeas((prev) => prev.filter((idea) => idea.$id !== id));
    toast("Idea removed");
  }

  return (
    <IdeasContext.Provider value={{ current: ideas, add, remove, fetch }}>
      {children}
    </IdeasContext.Provider>
  );
}
