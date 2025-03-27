import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HardDrive, Upload, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <HardDrive className="h-6 w-6" />
            <span className="text-xl font-bold">CloudDrive</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Your Files, Anywhere, Anytime
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Securely store, access, and share your files with our cloud storage solution powered by Google
                    Drive.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-1">
                      Get Started <Upload className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 p-6 dark:from-blue-900 dark:to-indigo-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 w-24 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
                        <FileText className="h-full w-full text-blue-500" />
                      </div>
                      <div className="h-24 w-24 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
                        <FileText className="h-full w-full text-green-500" />
                      </div>
                      <div className="h-24 w-24 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
                        <FileText className="h-full w-full text-yellow-500" />
                      </div>
                      <div className="h-24 w-24 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
                        <FileText className="h-full w-full text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to manage your files in one place
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Google Drive Integration</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Seamlessly connect with your Google account for secure storage.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Easy File Management</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload, download, and organize your files with a simple interface.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Secure Sharing</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Share files with others securely and control access permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-6 w-6" />
              <span className="text-xl font-bold">CloudDrive</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} CloudDrive. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-8">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Help</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

