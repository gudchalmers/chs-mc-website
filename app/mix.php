<?php
if (! function_exists('starts_with')) {
    function starts_with($haystack, $needle) {
        
        // search backwards starting from haystack length characters from the end
        return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
        
    }
}
if (! function_exists('mix')) {
    /**
     * Get the path to a versioned Mix file.
     *
     * @param string $path
     * @param string $manifestDirectory
     * @return string
     *
     * @throws \Exception
     */
    function mix($path, $manifestDirectory = '')
    {
        static $manifests = [];

        $publicFolder = '';
        $rootPath = $_SERVER['DOCUMENT_ROOT'];
        $publicPath = $rootPath . $publicFolder;
        
        if (! starts_with($path, '/')) {
            $path = "/{$path}";
        }

        if ($manifestDirectory && ! starts_with($manifestDirectory, '/')) {
            $manifestDirectory = "/{$manifestDirectory}";
        }

        if (file_exists($publicPath . $manifestDirectory . '/hot')) {
            $url = rtrim(file_get_contents($publicPath . $manifestDirectory . '/hot'), "/ \t\n\r\0\x0B");
            return $url . $path;
        }

        $manifestPath = $publicPath . $manifestDirectory . '/mix-manifest.json';

        if (! isset($manifests[$manifestPath])) {
            if (! file_exists($manifestPath)) {
                throw new Exception("The Mix manifest does not exist at: {$manifestPath}");
            }

            $manifests[$manifestPath] = json_decode(file_get_contents($manifestPath), true);
        }

        $manifest = $manifests[$manifestPath];

        if (! isset($manifest[$path])) {
            throw new Exception("Unable to locate Mix file: {$path}.");
        }
        
        return $manifestDirectory.$manifest[$path];
    }
}