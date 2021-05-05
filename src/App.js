import React, { useEffect, useState } from "react";
import axios from "axios";
import FileSaver from "file-saver";
import "./App.css";
import { Formik } from "formik";
function App() {
  const [alldata, setAlldata] = useState([]);
  const [loader, setLoader] = useState();
  return (
    <div className="App">
      <div className="form-main">
        <h1>Download HUB Docs</h1>
        <Formik
          initialValues={{ id: "335016", from: "", to: "" }}
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
            setLoader("Loading data....");
            axios({
              url: `https://jivetestingapi.herokuapp.com/getjivedata/${values.id}/${values.from}/${values.to}`, // download url
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
              const tempArray = [];
              response?.data?.list?.map((lister) => {
                if (lister?.type?.toLowerCase() === "file") {
                  tempArray.push(lister);
                  // tempArray.push(lister?.binaryURL)
                  FileSaver.saveAs(lister?.binaryURL, lister?.name);
                }
              });
              setAlldata(tempArray);
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
                <label>Enter space ID</label>
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
              <button type="submit" disabled={isSubmitting}>
                Download
              </button>
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
              <th>URL</th>
            </thead>
            <tbody>
              {alldata?.map((value) => {
                return (
                  <tr>
                    <td>{value.name}</td>
                    <td>{value.size}</td>
                    <td>{value.binaryURL}</td>
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
