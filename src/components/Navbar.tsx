import Link from "next/link"

const Navbar = () => {
    return (
        <nav className="px-6 py-4">

            <div><Link className="font-bold text-lg" href={'/'} >Drill AI Intelligence Platfrom</Link>

            </div>

        </nav>
    )
}

export default Navbar