import React, { useEffect, useState } from "react";
import axios from "axios";
import FileSaver from "file-saver";
import "./App.css";
import { Formik } from "formik";
function App() {
  const [alldata, setAlldata] = useState([]);
  const [loader, setLoader] = useState();
  const [nextbtn, setNext] = useState(null);
  const [spaceId, setSpaceId] = useState(null);
  return (
    <div className="App">
      <div className="form-main">
        <h1>Download HUB Docs</h1>
        <Formik
          initialValues={{ id: "people-portal", from: "", to: "" }}
          validate={(values) => {
            const errors = {};
            if (!values.id) {
              errors.id = "Required";
            }
            if (!values.from) {
              errors.from = "Required";
            }
            if (!values.to) {
              errors.to = "Required";
            } else if (
              !(values.to - values.from > 0 && values.to - values.from <= 50)
            ) {
              errors.to = "docs limit should be between 0 to 50";
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            setNext(false);
            setAlldata([]);
            setLoader("verifying  URL....");
            axios({
              url: `https://jivetestingapi.herokuapp.com/getspaceid/${values.id}`,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            })
              .then((spaceId) => {
                if (spaceId.data?.placeID) {
                  setSpaceId(spaceId.data?.placeID)
                  setLoader("your download will start soon, please wait....");
                  axios({
                    url: `https://jivetestingapi.herokuapp.com/getjivedata/${spaceId.data.placeID}/${values.from}/${values.to}`, // download url
                    method: "get",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                  })
                    .then((response) => {
                      setLoader("");
                      if (response.data?.error) {
                        setLoader(response.data?.error?.message);
                        return;
                      }
                      if (response?.data?.links?.next) {
                        setNext(true);
                      }
                      const tempArray = [];
                      response?.data?.list?.map((lister) => {
                        if (lister?.type?.toLowerCase() === "file") {
                          tempArray.push(lister);
                          // tempArray.push(lister?.binaryURL)
                          FileSaver.saveAs(lister?.binaryURL, lister?.name);
                        }
                      });
                      setAlldata(tempArray);
                    })
                    .catch((e) => {
                      setLoader("something went wrong, try again");
                    });
                } else {
                  setLoader("spaceid not found, try with another URL");
                }
              })
              .catch((e) => {
                setLoader("Invalid Url");
              });
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Enter URL</label>
                <input
                  type="text"
                  name="id"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.id}
                />
                {errors.id && touched.id && errors.id}
              </div>

              <div className="form-group">
                <label>from</label>
                <input
                  type="number"
                  name="from"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.from}
                />
                {errors.from && touched.from && errors.from}
              </div>
              <div className="form-group">
                <label>to</label>
                <input
                  type="number"
                  name="to"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.to}
                />
                {errors.to && touched.to && errors.to}
              </div>
              <div classNAme="dual">
                <button type="submit">Download</button>
                &nbsp;
                {!!nextbtn && (
                  <button
                    type="submit"
                    onClick={() => {
                      setNext(false);
                      setAlldata([])
                      setLoader(
                        "your download will start soon, please wait...."
                      );
                      axios({
                        url: `https://jivetestingapi.herokuapp.com/getjivedata/${spaceId}/${values.to + values.from}/${values.to - values.from}`, // download url
                        method: "get",
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                        },
                      })
                        .then((response) => {
                          setLoader("");
                          if (response.data?.error) {
                            setLoader(response.data?.error?.message);
                            return;
                          }
                          if (response?.data?.links?.next) {
                            setNext(true);
                          }
                          const tempArray = [];
                          response?.data?.list?.map((lister) => {
                            if (lister?.type?.toLowerCase() === "file") {
                              tempArray.push(lister);
                              // tempArray.push(lister?.binaryURL)
                              FileSaver.saveAs(lister?.binaryURL, lister?.name);
                            }
                          });
                          setAlldata(tempArray);
                        })
                        .catch((e) => {
                          setLoader("something went wrong, try again");
                        })
                        .catch((e) => {
                          setLoader("Invalid Url");
                        });
                    }}
                  >
                    Download next {(values.to - values.from) +1} items
                  </button>
                )}
              </div>
            </form>
          )}
        </Formik>
      </div>

      <div className="avialable">
        {alldata?.length > 0 ? (
          <table>
            <thead>
              <th>Name</th>
              <th>Size</th>
            </thead>
            <tbody>
              {alldata?.map((value) => {
                return (
                  <tr>
                    <td>{value.name}</td>
                    <td>{(value.size / 1024 / 1024).toFixed(2)} MB</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <h3>{loader}</h3>
        )}
      </div>
    </div>
  );
}

export default App;
