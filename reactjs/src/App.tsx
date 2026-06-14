import Navbar from './components/Navbar';
import Home from './pages/Home';
import SoftBackdrop from './components/SoftBackdrop';
import Footer from './components/Footer';
import LenisScroll from './components/lenis';
import { Route, Routes } from 'react-router-dom';
import Generation from './pages/Generation';
import Result from './pages/Result';
import MyGeneration from './pages/MyGeneration';
import { Community } from './pages/Community';
import Plans from './pages/Plans';
import Loading from './pages/Loading';
import { toast, Toaster } from 'react-hot-toast'

function App() {
	return (
		<>
			<Toaster toastOptions={{ style: { background: '#fdfafa', color: "fff" } }} />
			<SoftBackdrop />
			<LenisScroll />
			<Navbar />
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/generate' element={<Generation />} />
				<Route path='/result/:projectId' element={<Result />} />
				<Route path='/my-generation' element={<MyGeneration />} />
				<Route path='/community' element={<Community />} />
				<Route path='/plans' element={<Plans />} />
				<Route path='/loading' element={<Loading />} />







			</Routes>
			<Footer />
		</>
	);
}
export default App;