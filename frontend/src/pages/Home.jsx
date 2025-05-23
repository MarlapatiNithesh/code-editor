import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setProject } from "../redux/userStore";

function Home() {
  const dispatch = useDispatch();
  const { userData, project } = useSelector((state) => state.user);

  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleCreateClick = () => setIsCreateModelShow(true);

  const handleModalClose = () => {
    setIsCreateModelShow(false);
    setProjectName("");
    setSelectedLanguage(null);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName || !selectedLanguage) {
      alert("Please enter a project name and select a language.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/createproject`,
        {
          name: projectName,
          projLanguage: selectedLanguage.value,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setSuccessMessage("Project created successfully!");
        await getProjects();
        setTimeout(() => setSuccessMessage(""), 3000);

        setTimeout(() => {
          handleModalClose();
          const projectId = response.data?.project?.id;
          const projLanguage = response.data?.project?.projLanguage;

          const selected = languageOptions.find(
            (option) => option.value === projLanguage
          );

          console.log("selected runtime:", selected);

          if (projectId && selected?.version) {
            navigate(`/editor/${projectId}/${selected.version}`);
          } else {
            console.warn("Missing project ID or language version for navigation.");
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project. Please try again.");
    }
  };

  const getRunTimes = async () => {
    try {
      setLoadingLanguages(true);
      const res = await fetch("https://emkc.org/api/v2/piston/runtimes");
      const data = await res.json();

      const filteredLanguages = ["python", "javascript", "c", "c++", "java", "bash"];
      const options = data
        .filter((runtime) => filteredLanguages.includes(runtime.language))
        .map((runtime) => ({
          label: `${runtime.language} (${runtime.version})`,
          value: runtime.language === "c++" ? "cpp" : runtime.language,
          version: runtime.version,
        }));

      setLanguageOptions(options);
    } catch (error) {
      console.error("Failed to fetch runtimes:", error);
    } finally {
      setLoadingLanguages(false);
    }
  };

  const getProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/getprojects`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        dispatch(setProject(response.data.projects));
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    getRunTimes();
    getProjects();
  }, []);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#1f1f1f",
      borderColor: "#444",
      color: "#fff",
      padding: "2px 4px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1f1f1f",
      color: "#fff",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#333" : "#1f1f1f",
      color: "#fff",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#aaa",
    }),
  };

  const getProjectImage = (lang) => {
    const images = {
      python: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
      javascript: "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
      cpp: "https://cdn-icons-png.flaticon.com/512/6132/6132222.png",
      c: "https://cdn-icons-png.flaticon.com/512/6132/6132221.png",
      java: "https://cdn-icons-png.flaticon.com/512/226/226777.png",
      bash: "https://cdn-icons-png.flaticon.com/512/919/919847.png",
    };
    return images[lang] || "https://cdn-icons-png.flaticon.com/512/565/565547.png";
  };

  const selectedProject = (value) => {
    console.log(value)
    if(value){
      setTimeout(() => {
        const selected = languageOptions.find((option) => option.value === value.projLanguage)
        const projectId = value._id
        if (projectId && selected?.version) {
            navigate(`/editor/${projectId}/${selected.version}`);
          } else {
            console.warn("Missing project ID or language version for navigation.");
          }
      },100);

    }
  }

  const deleteProject = async (value) => {
     try{
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/deleteproject/${value._id}`,{
        withCredentials:true
      })
      if (response.status === 200) {
        console.log("Project deleted")
         await getProjects();
      }
     }catch(err){
      console.error(err)
     }
  }

  const sortedProjects = project
    ? [...project].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];



  return (
    <>
      <Navbar />
      <div className="pt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-10 md:px-20 mt-6 gap-4">
          <h3 className="text-xl sm:text-2xl capitalize text-white">
            👋 Hi, {userData?.fullname}
          </h3>
          <button
            onClick={handleCreateClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto"
          >
            Create Project
          </button>
        </div>

        <div className="projects px-4 sm:px-10 md:px-20 mt-6 space-y-4">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project, index) => (
              <div
                key={index}
                className="project w-full p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#0f0e0e] rounded-lg shadow-md gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    className="w-28 h-24 object-contain rounded flex-shrink-0"
                    src={getProjectImage(project.projLanguage)}
                    alt={`${project.projLanguage} logo`}
                  />
                  <div className="text-white min-w-0">
                    <h4 className="text-lg font-semibold truncate">{project.name}</h4>
                    <p className="text-sm text-gray-400 capitalize truncate">
                      Language: {project.projLanguage}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {new Date(project.date).toDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                  <button
                    onClick={() => selectedProject(project)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-black whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white whitespace-nowrap"
                    onClick={() => deleteProject(project)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-4">No projects found.</p>
          )}
        </div>

        {isCreateModelShow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
              onSubmit={handleCreateProject}
              className="bg-[#1a1a1a] p-6 rounded-lg w-[90%] max-w-md shadow-xl text-white"
            >
              <h3 className="text-xl font-semibold mb-4">Create Project</h3>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                className="border border-gray-600 bg-[#111] text-white p-2 rounded w-full mb-4"
                autoFocus
              />

              {loadingLanguages ? (
                <p className="text-gray-400 mb-4">Loading languages...</p>
              ) : (
                <Select
                  options={languageOptions}
                  styles={customStyles}
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  placeholder="Select Language"
                  className="mb-4"
                />
              )}

              {selectedLanguage && (
                <p className="text-green-500 mb-4">
                  Selected Language: {selectedLanguage.label}
                </p>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {successMessage && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50">
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
