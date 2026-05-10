import { useState } from "react";
import Layout from "@/components/Layout";
import Home from "./Home";
import Cabinet from "./Cabinet";
import FAQ from "./FAQ";
import Contacts from "./Contacts";

type Page = "home" | "cabinet" | "faq" | "contacts";

export default function Index() {
  const [page, setPage] = useState<Page>("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <Home />;
      case "cabinet": return <Cabinet />;
      case "faq": return <FAQ />;
      case "contacts": return <Contacts />;
    }
  };

  return (
    <Layout page={page} onNav={setPage}>
      {renderPage()}
    </Layout>
  );
}
