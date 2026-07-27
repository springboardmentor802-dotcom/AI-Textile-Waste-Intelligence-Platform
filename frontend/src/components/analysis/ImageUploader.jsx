import { Upload } from "lucide-react";

function ImageUploader({
    previews,
    onChange
}) {

    return (

        <div className="space-y-6">

            <label
                className="
                    border-2
                    border-dashed
                    rounded-xl
                    h-80
                    flex
                    flex-col
                    justify-center
                    items-center
                    cursor-pointer
                    hover:border-green-500
                "
            >

                {previews.length > 0 ? (

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 w-full h-full overflow-auto">

                        {previews.map((preview, index) => (

                            <img
                                key={index}
                                src={preview}
                                alt={`preview-${index}`}
                                className="rounded-lg h-36 w-full object-cover border"
                            />

                        ))}

                    </div>

                ) : (

                    <>

                        <Upload size={50} />

                        <p className="mt-4 font-medium">
                            Upload Fabric Images
                        </p>

                        <p className="text-sm text-gray-500">
                            JPG PNG JPEG
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                            You can upload multiple images
                        </p>

                    </>

                )}
                <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onChange}
                />
            </label>

        </div>

    );

}

export default ImageUploader;