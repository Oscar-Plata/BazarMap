const { Router } = require("express");
const router = Router();
const firebase = require("firebase-admin");
const serviceAccount = require("../../bazarmap-nodejs-firebase-adminsdk-fjt5q-c68a0dc5ce.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://bazarmap-nodejs-default-rtdb.firebaseio.com/",
});
const db = firebase.database();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/agregar-locales", (req, res) => {
  db.ref("locales").once("value", (snapshot) => {
    const data = snapshot.val();
    res.render("locales", { locales: data });
  });
});

router.post("/add-local", (req, res) => {
  const newLocal = {
    nombre: req.body.nombreLocal,
    productos: req.body.selectProducto,
  };
  newLocal.viernes = req.body.viernesCH ? 1 : 0;
  newLocal.sabado = req.body.sabadoCH ? 1 : 0;
  newLocal.domingo = req.body.domingoCH ? 1 : 0;
  console.log(newLocal);
  db.ref("locales").push(newLocal);
  res.redirect("/agregar-locales");
});

router.get("/agregar-eventos", (req, res) => {
  db.ref("eventos").once("value", (snapshot) => {
    const data = snapshot.val();
    res.render("eventos", { eventos: data });
  });
});

router.post("/add-evento", (req, res) => {
  const newEvento = {
    nombre: req.body.nombreEvento,
    descripcion: req.body.descEvento,
    costo: req.body.costoEvento,
  };
  console.log(newEvento);
  db.ref("eventos").push(newEvento);
  res.redirect("/agregar-eventos");
});

router.get("/agregar-duenos", (req, res) => {
  db.ref("duenos").once("value", (snapshot) => {
    const data = snapshot.val();
    res.render("duenos", { duenos: data });
  });
});

router.post("/add-dueno", (req, res) => {
  const newDueno = {
    nombre: req.body.nombreDueno,
    email: req.body.emailDueno,
    telefono: req.body.telefonoDueno,
  };
  console.log(newDueno);
  db.ref("duenos").push(newDueno);
  res.redirect("/agregar-duenos");
});

router.get("/verMapa", async (req, res) => {
  try {
    const snapshot = await db.ref("mapa").once("value");
    const mapa = snapshot.val();

    if (!mapa) {
      return res.render("verMapa", { mapa: [] });
    }

    const { eventosSel, zonas } = mapa;
    const [eventosSnapshot, localesSnapshot, duenosSnapshot] = await Promise.all([
      db.ref("eventos").once("value"),
      db.ref("locales").once("value"),
      db.ref("duenos").once("value"),
    ]);

    const eventos = eventosSnapshot.val();
    const locales = localesSnapshot.val();
    const duenos = duenosSnapshot.val();
    const evento = eventos[eventosSel] || {};

    const zonasWithDetails = zonas.map((zona) => ({
      label: `Zona ${zona.id}`,
      local: locales[zona.local] || {},
      dueno: duenos[zona.dueno] || {},
    }));

    res.render("mapa", { mapa: zonasWithDetails, evento: evento });
  } catch (error) {
    console.error("Error al obtener el mapa de Firebase:", error);
    res.status(500).send("Error al obtener el mapa de Firebase");
  }
});

router.post("/guardarMapa", (req, res) => {
  const data = req.body;
  console.log(data);

  const mapa = {
    eventosSel: data.eventosSel,
    zonas: [],
  };

  for (let i = 1; i <= 8; i++) {
    const zona = {
      id: i,
      local: data[`${i}.local`],
      dueno: data[`${i}.dueno`],
    };
    mapa.zonas.push(zona);
  }

  // Save to Firebase
  db.ref("mapa").set(mapa, (error) => {
    if (error) {
      console.error("Error al guardar el mapa en Firebase:", error);
      res.status(500).send("Error al guardar el mapa en Firebase");
    } else {
      res.redirect("/organizar");
    }
  });
});

router.post("/add-evento", (req, res) => {
  const newEvento = {
    nombre: req.body.nombreEvento,
    descripcion: req.body.descEvento,
    costo: req.body.costoEvento,
  };
  console.log(newEvento);
  db.ref("eventos").push(newEvento);
  res.redirect("/agregar-eventos");
});

router.get("/organizar", async (req, res) => {
  try {
    let locales;
    let duenos;
    let eventos;
    const zonas = [
      {
        id: 1,
        label: "Zona 1 - Izquierda",
      },
      {
        id: 2,
        label: "Zona 2 - Izquierda",
      },
      {
        id: 3,
        label: "Zona 3 - Izquierda",
      },
      {
        id: 4,
        label: "Zona 4 - Izquierda",
      },
      {
        id: 5,
        label: "Zona 5 - Izquierda",
      },
      {
        id: 6,
        label: "Zona 6 - Derecha",
      },
      {
        id: 7,
        label: "Zona 7 - Derecha",
      },
      {
        id: 8,
        label: "Zona 8 - Derecha",
      },
    ];

    const [localesSnapshot, duenosSnapshot, eventosSnapshot] = await Promise.all([
      db.ref("locales").once("value"),
      db.ref("duenos").once("value"),
      db.ref("eventos").once("value"),
    ]);
    locales = localesSnapshot.val();
    duenos = duenosSnapshot.val();
    eventos = eventosSnapshot.val();

    res.render("acomodar", { zonas: zonas, locales: locales, eventos: eventos, duenos: duenos });
  } catch (error) {
    console.error("Error al obtener datos de Firebase:", error);
    res.status(500).send("Error al obtener datos de Firebase");
  }
});

router.get("/borrarDueno/:id", (req, res) => {
  db.ref("duenos/" + req.params.id).remove();
  res.redirect("/agregar-duenos");
});

router.get("/borrarLocal/:id", (req, res) => {
  db.ref("locales/" + req.params.id).remove();
  res.redirect("/agregar-locales");
});

router.get("/borrarEvento/:id", (req, res) => {
  db.ref("eventos/" + req.params.id).remove();
  res.redirect("/agregar-eventos");
});

module.exports = router;
