import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import FileSaver from "file-saver";
import { Tabs, Modal, Tab, Alert } from "react-bootstrap";
import "./App.css";
import { Formik, Field, Form } from "formik";
const queryString = require('query-string');
function App() {
  const [alldata, setAlldata] = useState([]);
  const [loader, setLoader] = useState();
  const [nextbtn, setNext] = useState(null);
  const [spaceId, setSpaceId] = useState(null);
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const timer = (ms) => new Promise((res) => setTimeout(res, ms));
  const tempArray = [];
  const currentDate =  new Date();
  const onSubmitMain = (id,count,start, values) => {
    axios({
      url: `https://f54saj9199.execute-api.us-east-1.amazonaws.com/getjivedata/${id}/${count}/${start}`,
      method: "get",
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded' ,
        Authorization:"Basic cGVvcGxlX3BvcnRhbF9wb2xpY2llczpXZWxjb21lMjAyMA==",
        // "Content-Type": "application/json",
        // 'Access-Control-Allow-Headers': "*",
        // 'Access-Control-Allow-Origin': "*",
      },
    }).then((response) => {
      setLoader("");
      if (response.data?.error) {
        setLoader(response.data?.error?.message);
        return;
      }

      const lister = response?.data?.list;
      const fromDate =  new Date(values.fromDate);
      const ToDate =  new Date(values.toDate);
      async function load() {
        //  response?.data?.list?.map(async function(lister)
        for (var i = 0; i < response?.data?.list.length; i++) {
          const publishedDate = new Date(lister[i].published)
         
          if ((fromDate <= publishedDate  <= ToDate) ) {
         
          if (values.checked.includes(lister[i]?.type?.toLowerCase())) {
            // tempArray.push(lister?.binaryURL)
            if (lister[i]?.type?.toLowerCase() === "video") {
              if (lister.playerBaseURL) {
                tempArray.push(lister[i]);
                const link = document.createElement("a");
                link.href = lister[i].playerBaseURL;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            } else if (lister[i]?.type?.toLowerCase() === "file") {
              tempArray.push(lister[i]);
              const link = document.createElement("a");
              link.href = lister[i]?.binaryURL;
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else if (lister[i]?.type?.toLowerCase() === "post") {
              tempArray.push(lister[i]);
              const link = document.createElement("a");
              link.href = lister[i]?.permalink + ".pdf";
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else if (lister[i]?.type?.toLowerCase() === "document") {
              tempArray.push(lister[i]);
              const link = document.createElement("a");
              link.href = lister[i]?.resources.html.ref + ".pdf";
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            else if (lister[i]?.type?.toLowerCase() === "idea") {
              tempArray.push(lister[i]);
              const link = document.createElement("a");
              link.href = lister[i]?.resources.html.ref + ".pdf";
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            else if (lister[i]?.type?.toLowerCase() === "discussion"  ) {
              tempArray.push(lister[i]);
              const link = document.createElement("a");
              link.href = lister[i]?.resources.html.ref + ".pdf";
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            // else if (lister[i]?.type?.toLowerCase() === "discussion" && !lister[i].question ) {
            //   tempArray.push(lister[i]);
            //   const link = document.createElement("a");
            //   link.href = lister[i]?.resources.html.ref + ".pdf";
            //   link.target = "_blank";
            //   document.body.appendChild(link);
            //   link.click();
            //   document.body.removeChild(link);
            // }



            
            console.log(tempArray);
          }}
          if (i === response?.data?.list.length - 1) {
            setAlldata(tempArray);
            setLoader("");
          }
          await timer(1000);
        }
      }

      load();

      if (response?.data?.links?.next) {
        const parsed = queryString.parse(response?.data?.links?.next);
        
      onSubmitMain(id,parsed.count,parsed.startIndex, values);
      }
    });
  };
  return (
    <div className="App">
      <div className="form-main">
        <a class="settings" href="#!" onClick={handleShow}>
          Goto Settings
        </a>
        <br />
        <br />
        <h2 class="title">The Hub Content Downloader</h2>
        <Formik
          initialValues={{
            id: "https://thehub.spglobal.com/community/people-portal",
            from: 1,
            to: 20,
            fromDate:'2010-01-01',
            toDate:currentDate.toISOString().split('T')[0],
            checked: ["document", "file", "post", "question", "idea", "discussion"],
          }}
          validate={(values) => {
            const errors = {};
            if (!values.id) {
              errors.id = "Required";
            }
            if (!values.from) {
              errors.from = "Required";
            }

            if (!values.fromDate) {
              errors.fromDate = "From Date Required";
            }

            if (!values.toDate) {
              errors.toDate = "To Date Required";
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
              url: `https://3ypcsp05df.execute-api.us-east-1.amazonaws.com/test/url?url=${values.id.replace('thehub.spglobal.com', 'spglobal.jiveon.com')}/api/v3`,
             
            })
              .then((spaceId) => {
                const idSpace = JSON.parse(spaceId.data)
                if (idSpace?.placeID) {
                  setSpaceId(idSpace?.placeID);
                  setLoader("your download will start soon, please wait....");
                  onSubmitMain(
                    idSpace?.placeID,25,0,
                    values
                  );
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
                <label class="label-url">Enter a space URL:</label>
                <input
                  type="text"
                  name="id"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.id}
                
                />
                {errors.id && touched.id && errors.id}
              </div>
          

              <div
                role="group"
                className="chekcbox"
                aria-labelledby="checkbox-group"
              >
                <label>
                  <Field type="checkbox" name="checked" value="file" />
                  Files
                </label>
                <label>
                  <Field type="checkbox" name="checked" value="document" />
                  Documents
                </label>
                <label style={{ display: "none" }}>
                  <Field
                    type="checkbox"
                    name="checked"
                    disabled
                    value="video"
                  />
                  Videos
                </label>
                <label>
                  <Field type="checkbox" name="checked" value="post" />
                  Blogs
                </label>
                
                <label>
                  <Field type="checkbox" name="checked" value="discussion" />
                  Discussions & Questions
                </label>
               
                <label>
                  <Field type="checkbox" name="checked" value="idea" />
                  Ideas
                </label>
              </div>
              <div className="options">
              <label>
                  
                  Filter data by Date
                </label>
                <br />
                From: &nbsp; &nbsp;
                <input
                   type="date"
                   name="fromDate"
                   onChange={handleChange}
                   onBlur={handleBlur}
                   value={values.fromDate}
                />
                &nbsp;&nbsp;To&nbsp;&nbsp;
                <input
                   type="date"
                   name="toDate"
                   onChange={handleChange}
                   onBlur={handleBlur}
                   value={values.toDate}
                />

              </div>
              {errors.fromDate && touched.fromDate && errors.fromDate}
              <br />
              {errors.toDate && touched.toDate && errors.toDate}
              <div classNAme="dual">
                <button type="submit">Download</button>
              </div>
            </form>
          )}
        </Formik>
      </div>

      <div className="avialable">
        {alldata?.length > 0 ? (
          <Tabs defaultActiveKey="BLOGS" id="uncontrolled-tab-example">
            <Tab eventKey="PDF" title="FILES">
              <table>
                <thead>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Publish Date</th>
                </thead>
                <tbody>
                  {alldata?.map((value) => {
                    return (
                      value.type === "pdf" && (
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
                      value.type === "document" && (
                        <tr>
                          <td>{value.subject}</td>
                          <td></td>
                          <td>{value.published}</td>
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </table>
            </Tab>
            <Tab eventKey="IDEAS" title="IDEAS">
              <table>
                <thead>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Publish Date</th>
                </thead>
                <tbody>
                  {alldata?.map((value) => {
                    return (
                      value.type === "video" && (
                        <tr>
                          <td>{value.subject}</td>

                          <td></td>
                          <td>{value.published}</td>
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </table>
            </Tab>
            <Tab eventKey="BLOGS" title="BLOGS">
              <table>
                <thead>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Publish Date</th>
                </thead>
                <tbody>
                  {alldata?.map((value) => {
                    return (
                      value.type === "post" && (
                        <tr>
                          <td>{value.subject}</td>
                          <td></td>
                          <td>{value.publishDate} </td>
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </table>
            </Tab>
            <Tab eventKey="DISCUSSIONS" title="DISCUSSIONS & QUESTIONS">
              <table>
                <thead>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Publish Date</th>
                </thead>
                <tbody>
                  {alldata?.map((value) => {
                    return (
                      value.type === "discussion" && (
                        <tr>
                          <td>{value.subject}</td>
                          <td></td>
                          <td>{value.publishDate} </td>
                        </tr>
                      )
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
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <h2>Browser settings before you use</h2>
        </Modal.Header>

        <Modal.Body>
          <h4 className="red">Mandatory settings</h4>
          
          <p>
            By default , Broswer open pdf file in new tab instead of download,
            We have to change Browser settings to download pdf. follow below
            instructions to change settings.
          </p>
          <ol>
            <li class="search-result">Open Google Chrome</li>
            <li>For Security Concerns, we have to add CORS extension. Open <a href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino?hl=en" target="_blank">CORS </a>
             Link and activitate CORS extension before using the tool.
            </li>
            <li class="search-result">
              Click on the&nbsp;<strong>Menu</strong> icon in the top-right
              corner of the Window (it will be the button that looks like three
              vertical dots)
            </li>
            <li class="search-result">
              Click&nbsp;<strong>Settings</strong>
            </li>
            <li class="search-result">
              Click on the <em>Privacy and security</em> section on the left
            </li>
            <li class="search-result">
              Click <strong>Site Settings</strong>. Then{" "}
              <strong>Additional Content Settings</strong>
            </li>
            <li class="search-result">
              Scroll down and click the&nbsp;<strong>PDF documents</strong>{" "}
              option
            </li>
            <li class="search-result">
              Change the "Download PDF files instead of automatically opening
              them in Chrome" option from the off position (grey) to the on
              position (blue)
            </li>
            <li class="search-result">
              Close the Settings tab and restart your browser
            </li>
          </ol>

          <br />
          <h4>Optional settings</h4>
         
          <p>
            We will be downloading a lot of differnet documents, so it is recomnded
            to change your default browser download path to some specfic path.
            follow below steps to change download path.
          </p>
          <ol>
            <li>On your computer, open Chrome.</li>
            <li>
              At the top right, click More{" "}
              <img
                src="//lh3.googleusercontent.com/oLoRPrHJd7m46sWijX6zBWnEnfslP62AxJSwt5Nj0bNbpaYHz2pyscExleiofsH2kQ=h36"
                width="Auto"
                height="18"
                alt="More"
                title="More"
                data-mime-type="image/png"
              />{" "}
              <img
                src="//lh3.googleusercontent.com/3_l97rr0GvhSP2XV5OoCkV2ZDTIisAOczrSdzNCBxhIKWrjXjHucxNwocghoUa39gw=w36-h36"
                width="18"
                height="18"
                alt="and then"
                title="and then"
                data-mime-type="image/png"
              />{" "}
              <strong>Settings</strong>.
            </li>
            <li>
              At the bottom, click <strong>Advanced</strong>.
            </li>
            <li data-outlined="false" class="">
              Under the "Downloads" section, adjust your download settings.
              To change the default download location, click{" "}
                  <strong>Change</strong> and select where you'd like your files
                  to be saved.
            </li>
          </ol>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
