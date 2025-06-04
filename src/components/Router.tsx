import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import TestPage from "../pages/TestPage";

function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/test" element={<TestPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default Router;
