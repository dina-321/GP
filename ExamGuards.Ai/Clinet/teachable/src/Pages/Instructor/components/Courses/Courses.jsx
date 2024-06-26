import React, { useEffect, useState } from "react";
import "./style/courses.css";
import { getAuthUser } from "../../../../Helper/Storage";
import http from "./../../../../Helper/http";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { HiOutlineArchiveBoxXMark } from "react-icons/hi2";
import Pagination from "@mui/material/Pagination";
import { Link } from "react-router-dom";

const Courses = () => {
  const instructorID = getAuthUser()?.data?.data?.user?._id;
  const [page, setPage] = useState(1);
  const [showPagination, setShowPagination] = useState(false);
  const [courses, setCourses] = useState({
    loading: false,
    errorMsg: "",
    data: [],
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCourses({ ...courses, loading: true });
    http
      .GET(
        `courses?instructors=${instructorID}&active=true&page=${page}&limit=6`
      )
      .then((response) => {
        response.data.totalDocs > 6 && response.data.results === 6
          ? setShowPagination(true)
          : setShowPagination(false);
        setTotalPages(response.data?.totalPages);
        setCourses({
          ...courses,
          loading: false,
          data: response.data?.data?.data,
          errorMsg: "",
        });
      })
      .catch((error) => {
        setCourses({
          ...courses,
          loading: false,
          data: [],
          errorMsg: "Something went wrong",
        });
      });
  }, [page]);

  const handlePaginationChange = (event, value) => {
    // Update the page number
    if (value > 0 && value <= totalPages) {
      setPage(value);
    }
  };
  return (
    <section className="courses-instructor">
      <div className="container">
        {courses.loading &&
          courses.data.length === 0 &&
          courses.errorMsg === "" && (
            <CircularProgress
              sx={{
                margin: "auto",
                display: "block",
              }}
              size={60}
              color="inherit"
            />
          )}
        {!courses.loading && courses.errorMsg !== "" && (
          <Alert severity="error">{courses.errorMsg}</Alert>
        )}
        {!courses.loading && courses.data.length === 0 && (
          <div className="no-courses">
            <span>No Courses</span>
            <HiOutlineArchiveBoxXMark />
          </div>
        )}
        {courses.data.length > 0 &&
          courses.errorMsg === "" &&
          courses.loading === true && (
            <CircularProgress
              sx={{
                margin: "auto",
                display: "block",
              }}
              size={60}
              color="inherit"
            />
          )}

        {courses.data.length > 0 &&
          courses.errorMsg === "" &&
          courses.loading === false && (
            <>
              <div className="header">
                <h1>All Courses</h1>
              </div>
              <div className="all-assigned-courses">
                {courses.data.map((course) => {
                  return (
                    <div className="assigned-course" key={course._id}>
                      <div
                        className="course-img"
                        style={{ backgroundImage: `url(${course.file})` }}
                      ></div>
                      <div className="body">
                        <h3>{course.name}</h3>
                        <p>
                          {course.description.length > 90
                            ? `${course.description.slice(0, 90)}...`
                            : course.description}
                        </p>

                        <Link
                          to={`/instructor/course/${course._id}`}
                          className="view-course"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
              {showPagination && (
                <div className="custom-pagination">
                  <Pagination
                    page={parseInt(page)}
                    count={parseInt(totalPages)}
                    onChange={handlePaginationChange}
                    color="primary"
                  />
                </div>
              )}
            </>
          )}
      </div>
    </section>
  );
};

export default Courses;
