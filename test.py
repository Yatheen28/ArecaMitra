import tensorflow as tf
import numpy as np

IMG_SIZE=(380,380)
model=tf.keras.models.load_model("areca_leaf_model.h5")
class_names=[
"Healthy_Nut",
"healthy_leaf",
"mahali_kolerega",
"yellow_leaf"
]

def predict_leaf(image_path):
    img=tf.keras.utils.load_img(image_path, target_size=IMG_SIZE)
    img_array=tf.keras.utils.img_to_array(img)
    img_array=tf.expand_dims(img_array,0)
    predictions=model.predict(img_array)[0]
    predicted_class=class_names[np.argmax(predictions)]
    confidence=np.max(predictions) * 100
    print("Prediction:", predicted_class)
    print("Confidence:", round(confidence,2), "%")
     
predict_leaf("C:\FIR\PHOTOS\MAHALI\Mahali_Koleroga_original_743.jpg_7abbea9a-4400-493e-af32-eb4c012c94e8.jpg")