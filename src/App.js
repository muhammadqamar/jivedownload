import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSaver from "file-saver";
import {Tabs, Tab , Alert} from 'react-bootstrap'
import "./App.css";
import { Formik, Field, Form } from "formik";
function App() {
  const [alldata, setAlldata] = useState([]);
  const [loader, setLoader] = useState();
  const [nextbtn, setNext] = useState(null);
  const [spaceId, setSpaceId] = useState(null);
  return (
    <div className="App">
      <div className="form-main">
        <br/><br/>
        <h3>Document Downloader (PDF, Docx, Blogs (PDFs))</h3>
        <Formik
          initialValues={{
            id: "https://thehub.spglobal.com/community/sp_ratings",
            from: 1,
            to: 20,
            checked: ["document", "file", "video", "post"],
          }}
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
            // const cleanurl = values.id.site.replace(/\/$/, "");
            // alert(cleanurl)
            axios({
              url: `https://jivetestingapi.herokuapp.com/getspaceid/${values.id.split('/')[values.id.split('/').length-1]}`,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            })
              .then((spaceId) => {
                if (spaceId.data?.placeID) {
                  setSpaceId(spaceId.data?.placeID);
                  setLoader("your download will start soon, please wait....");
                  axios({
                    url: `https://jivetestingapi.herokuapp.com/getjivedata/${spaceId.data.placeID}/${values.from}/${values.to}`, // download url
                    method: "get",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                  }).then((response) => {
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
                      if (
                        values.checked.includes(lister?.type?.toLowerCase())
                      ) {
                        // tempArray.push(lister?.binaryURL)
                        if (lister?.type?.toLowerCase() === "video") {
                          if (lister.playerBaseURL) {
                            tempArray.push(lister);
                            const link = document.createElement("a");
                            link.href = lister.playerBaseURL;
                            link.target="_blank"
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        } else if (lister?.type?.toLowerCase() === "file") {
                          tempArray.push(lister);
                          FileSaver.saveAs(lister?.binaryURL, lister?.name);
                        } else if (lister?.type?.toLowerCase() === "post") {
                          tempArray.push(lister);
                          const link = document.createElement("a");
                          link.href = lister?.permalink+".pdf";
                          link.target="_blank"
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
              
                        }else if (lister?.type?.toLowerCase() === "document") {
                          tempArray.push(lister);
                        }

                        console.log(tempArray);
                      }
                    });

                    setAlldata(tempArray);
                  });
                  // .catch((e) => {
                  //   setLoader("something went wrong, try again");
                  // });
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
                <label>Enter space URL:</label>
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
                <label>To (max 50):</label>
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
                <label>From (min 1):</label>
                <input
                  type="number"
                  name="to"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.to}
                />
                {errors.to && touched.to && errors.to}
              </div>
              You can only download 50 documents at one time<br /><br />
              <div role="group" className="chekcbox" aria-labelledby="checkbox-group">
                <label>
                  <Field type="checkbox" name="checked" value="file" />
                  pdf
                </label>
                <label>
                  <Field type="checkbox" name="checked" value="document" />
                  doc
                </label>
                <label>
                  <Field type="checkbox" name="checked" value="video" />
                  video
                </label>
                <label>
                  <Field type="checkbox" name="checked" value="post" />
                  blogs
                </label>
              </div>

              <div classNAme="dual">
                <button type="submit">Download</button>
                {/* &nbsp;
                {!!nextbtn && (
                  <button
                    type="submit"
                    onClick={() => {
                      setNext(false);
                      setAlldata([]);
                      setLoader(
                        "your download will start soon, please wait...."
                      );
                      axios({
                        url: `https://jivetestingapi.herokuapp.com/getjivedata/${spaceId}/${
                          values.to + values.from
                        }/${values.to - values.from}`, // download url
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
                    Download next {values.to - values.from + 1}
                  </button>
                )} */}
              </div>
            </form>
          )}
        </Formik>
      </div>

      <div className="avialable">
        {alldata?.length > 0 ? (

           
      <Tabs defaultActiveKey="BLOGS" id="uncontrolled-tab-example">
      <Tab eventKey="PDF" title="PDF">
      <table>
            <thead>
            <th>Name</th>
              <th>Size</th>
              <th>Publish Date</th>
            </thead>
            <tbody>
              {alldata?.map((value) => {
                return (
                  value.type === 'pdf' && (
                  <tr>
                    <td>{value.name}</td>
                    <td>{(value.size / 1024 / 1024).toFixed(2)} MB</td>
                    <td>{value.published}</td>
                  </tr>
                  )
                );
              })}
            </tbody>
          </table>
      </Tab>
      <Tab eventKey="DOCUMENTS" title="DOCUMENTS">
      <table>
            <thead>
              <th>Name</th>
              <th>Size</th>
              <th>Publish Date</th>
            </thead>
            <tbody>
              {alldata?.map((value) => {
                return (
                  value.type === 'document' && (
                  <tr>
                    <td>{value.subject}</td>
                    <td></td>
                    <td>{value.published}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
      </Tab>
      <Tab eventKey="VIDEO" title="VIDEO" >
      <table>
            <thead>
            <th>Name</th>
              <th>Size</th>
              <th>Publish Date</th>
            </thead>
            <tbody>
              {alldata?.map((value) => {
               return  value.type === 'video' && (
                  <tr>
                    <td>{value.subject}</td>
                    
                    <td></td>
                    <td>{value.published}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </Tab>
      <Tab eventKey="BLOGS" title="BLOGS" >
      <table>
            <thead>
            <th>Name</th>
              <th>Size</th>
              <th>Publish Date</th>
            </thead>
            <tbody>
              {alldata?.map((value) => {
              return   value.type === 'post' && (
                  <tr>
                    <td>{value.subject}</td>
                    <td></td>
                    <td>{value.publishDate} </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </Tab>
    </Tabs>
      
        ) : (
          loader && <Alert variant="primary">{loader}</Alert>
        )}
      </div>
 

 
    </div>
  );
}

export default App;
